var hooks = require('./hooks');

var myFunction = function(name) {
	return 'Hello ' + name + '!';
};

myFunction = hooks.mount(myFunction);

// validate input and throw error with function name
myFunction.pre('myFunction', function(args, meta) {
	if (typeof args.name !== 'String')
		throw new Error('Name is not a string in ' + meta.name + ' function!');
});

// modify input
myFunction.pre('myFunction', function(args, meta) {
	args.name = args.name.toUpperCase();
});

// modify input
myFunction.pre('myFunction', function(args, meta) {
	args.name = args.name + '!';
});

// log information
myFunction.post('myFunction', function(args, meta) {
	console.log('myFunction fired with "' + args.name + '" name.');
});

myFunction('Anna');