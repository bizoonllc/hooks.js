var hooks = require('./hooks');

function myFunction (name) {
	return 'Hello ' + name + '!';
};

myFunction = hooks.mount(myFunction);

// validate input and throw error with function name
myFunction.$hooks.pre('myFunction', function(args, meta) {
	if (typeof args[0] !== 'String')
		throw new Error('Name is not a string in ' + meta.name + ' function!');
});

// modify input
myFunction.$hooks.pre('myFunction', function(args, meta) {
	args[0] = args[0].toUpperCase();
});

// modify input
myFunction.$hooks.pre('myFunction', function(args, meta) {
	args[0] = args[0] + '!';
});

// log information
myFunction.$hooks.post('myFunction', function(args, meta, result) {
	console.log('myFunction fired with "' + args[0] + '" name.');
});

myFunction('Anna');