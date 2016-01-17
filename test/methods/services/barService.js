'use strict';
let counter = 0;

module.exports.square = (x) => {

    return x * x;
};

module.exports.isEven = (n) => {

    return n % 2 === 0;
};

module.exports.increment = {
    options: {
        cache: {
            expiresIn: 60000,
            generateTimeout: 60000
        }
    },
    method: (next) => {

        return next(null, ++counter);
    }
};

module.exports.thisWillBeNotRegistered = {
    options: {
        cache: {
            expiresIn: 60000,
            generateTimeout: 60000
        }
    },
    something: (next) => {

        return next(null, ++counter);
    }
};
