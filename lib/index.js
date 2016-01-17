'use strict';
const FS = require('fs');
const Joi = require('joi');
const Path = require('path');

const internals = {};

const registeredMethods = {};

const schema = Joi.object().keys({
    relativeTo: Joi.string().default(''),
    methods: Joi.array().items(Joi.object().keys({
        prefix: Joi.string().required(),
        path: Joi.string().required()
    })) });

exports.register = (server, options, next) => {

    Joi.validate(options, schema, (err, validOptions) => {

        if (err) {
            return next(err);
        }
        internals.implementation(server, validOptions.relativeTo, validOptions.methods);

    });
    return next();
};

internals.implementation = (server, relativeTo, methods) => {

    for (const groupMethods of methods) {
        const methodsPath = Path.join(relativeTo, groupMethods.path);
        const files = FS.readdirSync(methodsPath);
        for (const file of files) {
            const filePath = Path.join(methodsPath, file);
            const serviceName = Path.basename(filePath, '.js');
            const stat = FS.statSync(filePath);
            if (stat.isFile()) {
                const module = require(filePath);
                const keys = Object.keys(module);

                for (const key of keys) {
                    const moduleProp = module[key];
                    const hapiMethodName = groupMethods.prefix + '.' + serviceName + '.' + key;
                    if (typeof (moduleProp) === 'function') {
                        server.method(hapiMethodName, moduleProp);
                    }
                    else if (moduleProp.options && moduleProp.method && typeof (moduleProp.method) === 'function') {
                        server.method(hapiMethodName, moduleProp.method, moduleProp.options);
                    }
                }
            }
        }
        for (const key in server.methods) {
            registeredMethods[key] = server.methods[key];
        }
    }
};

module.exports.methods = registeredMethods;

exports.register.attributes = {
    pkg: require('../package.json')
};
