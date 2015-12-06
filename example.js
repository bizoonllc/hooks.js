var hooks = require('./hooks');

var myFunction = function(name) {
	return 'Hello ' + name + '!';
};

myFunction = hooks.mount(myFunction);

myFunction.pre('myFunction', function(name) {
	if (typeof name !== 'String')
		throw new Error('Name is not a string!');
});

myFunction.pre('myFunction', function(name) {
	name = name.toUpperCase();
});

myFunction.pre('myFunction', function(name) {
	name = name + '!';
});

myFunction.post('myFunction', function(name) {
	console.log('myFunction fired with "' + name + '" name.');
});

myFunction('Anna');