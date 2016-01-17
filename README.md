# hapi-methods-injection

> Scan and register automatically your hapi methods

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dev Dependencies][david-badge]][david-url]


You can use this plugin to scan specified directories and register all found functions as hapi methods.

### Support
- `Hapi >= 10`      - Use version `1.x`

# Usage

###1. Installation :

```npm install --save hapi-methods-injection```

###2. Plugin configuration :

```js
 server.register({
  register: require('hapi-methods-injection'),
  options: {
		   options: {
                relativeTo: __dirname,
                methods: [{
                    prefix: 'services',
                    path: './server/api/services'
                },
                {
                    prefix: 'models',
                    path: './server/api/models'
                }]
            }
  }
}, function(err) {
  ...
});
```

###3. Methods examples :

assume that we have multiple services in ```/server/api/services``` folder like :

- **UserService.js** :
```js
'use strict';
module.export.createOrUpdate = function(user, next) {
	// call models and do some logic
	...
	next(null, userFromDb);
};
```
```createOrUpdate``` function will be registred by ```hapi-methods-injection``` plugin as Hapi method and can be accessed using : 
```js
server.methods.services.UserService.createOrUpdate(user, function(err, data){
	...
});
```

###4. How to call a method inside another existing method :

assume that we have a Model file ```User.js``` in ```/server/api/models``` folder defined as :
 - **User.js** :
```js
'use strict';
// database dependency here
module.exports.get = function (id, next) {
	// logic to get an existing user
	next(null, user);
};
module.exports.create = function (user, next) {
	// logic to insert new user
	next(null, createdUser);
};
module.exports.update = function (user, next) {
	// logic to update a user
	next(null, updatedUser);
};
```
**Calling models.User methods inside UserService :**

 - **UserService.js** :
```js
'use strict';
const context = require('hapi-methods-injection').methods;
const User = context.models.User;
module.export.createOrUpdate = function(user, next) {
	User.get(user.id, function(err, userFound){
		if(err) return next(err);
		if(userFound) {
			// assume that merge method is already declared.
			const mergedUser = merge(user, userFound);
			User.update(mergedUser, function(err, updatedUser){
				if(err) return next(err);
				return next(updatedUser);
			});
		 } else{
			 User.create(user, function(err, createdUser){
				if(err) return next(err);
				return next(createdUser);
			 });
		 }
	});
};
```
###5. Declaring Hapi options for a specific method :

Adding cache capability to ```User.get(id, next)``` :
- User.js :
```js
module.exports.get = {
    options: {
        cache: {
            expiresIn: 60000,
            generateTimeout: 60000
        }
    },
    method: function (id, next) {
	// logic to get an existing user
	next(null, user);
    }
};
...

```

[npm-badge]: https://badge.fury.io/js/hapi-methods-injection.svg
[npm-url]: https://badge.fury.io/js/hapi-methods-injection
[travis-badge]: https://travis-ci.org/toymachiner62/hapi-authorization.svg?branch=master
[travis-url]: https://travis-ci.org/amgohan/hapi-methods-injection
[coveralls-badge]: https://coveralls.io/repos/amgohan/hapi-methods-injection/badge.svg?branch=master&service=github
[coveralls-url]:  https://coveralls.io/github/amgohan/hapi-methods-injection?branch=master
[david-badge]: https://david-dm.org/amgohan/hapi-methods-injection.svg
[david-url]: https://david-dm.org/amgohan/hapi-methods-injection
