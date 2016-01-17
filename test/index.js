'use strict';

const Lab = require('lab');
const Code = require('code');
const Hapi = require('hapi');
const Plugin = require('../lib');


const lab = exports.lab = Lab.script();

const baseDir = __dirname;

lab.experiment('Plugin Registration', () => {

    lab.test('it registers successfully', (done) => {

        const server = new Hapi.Server();
        server.register({
            register: Plugin,
            options: {
                relativeTo: __dirname,
                methods: [{
                    prefix: 'myServices',
                    path: './methods/services'
                },
                {
                    prefix: 'myUtils',
                    path: './methods/utils'
                }]
            }
        },
        (err) => {

            Code.expect(err).to.not.exist();
            done();
        });

        // verify that all functions in fooService are registered and are functioning
        Code.expect(server.methods.myServices.fooService.add(1, 2), 'add').to.equal(3);
        Code.expect(server.methods.myServices.fooService.multiply(3, 2), 'multiply').to.equal(6);

        // verify that all functions in barService are registered and are functioning
        Code.expect(server.methods.myServices.barService.square(5), 'square').to.equal(25);
        Code.expect(server.methods.myServices.barService.isEven(4), 'isEven').to.equal(true);
        Code.expect(server.methods.myServices.barService.isEven(3), 'isEven').to.equal(false);
        server.methods.myServices.barService.increment((err, data) => {

            if (err) {
                console.error(err);
                return;
            }
            Code.expect(data, 'increment').to.equal(1);
        });
        //setTimeout(Code.expect(server.methods.myServices.barService.increment(), 'increment').to.equal(2), 11000);

        // verify that all functions in Strings utils are registered and are functioning
        Code.expect(server.methods.myUtils.Strings.concat('foo', 'bar')).to.equal('foobar');
    });

    lab.test('it didn\'t register when options are not valid', (done) => {

        const server = new Hapi.Server();
        server.register({
            register: Plugin,
            options: {
                methods: [{
                    x: 'myServices',
                    y: baseDir + '/methods/services'
                }]
            }
        },
        (err) => {

            if (err) {
                Code.expect(err.isJoi).to.equals(true);
                Code.expect(err.name).to.equals('ValidationError');
                done();
            }
        });
    });
});
