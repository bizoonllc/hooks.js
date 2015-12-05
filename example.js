var hooks = require('./hooks');

var $hooks = new hooks();

var myFunction = function(name) {
	return 'Hello ' + name + '!';
};

myFunction = $hooks.mount('myFunction', myFunction);

$hooks.pre('myFunction', function(name) {
	if (typeof name !== 'String')
		throw new Error('Name is not a string!');
});

$hooks.pre('myFunction', function(name) {
	return [name.toUpperCase()];
});

$hooks.pre('myFunction', function(name) {
	return [name + '!'];
});

$hooks.post('myFunction', function(name) {
	console.log('myFunction fired with "' + name + '" name.');
});

myFunction('Anna');