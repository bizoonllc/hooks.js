"use strict";
var hooks = require('./hooks');

function hello (name) {
	return 'Hello ' + name + '!';
};

hello = hooks.mount(hello);

// validate input and throw error with function name
hello.$hooks.pre(function($input, $inspect) {
	if (typeof $input[0] !== 'string')
		throw new Error('Name is not a string in ' + $inspect.name + ' function!');
});

// modify input
hello.$hooks.pre(function($input, $inspect) {
	$input[0] = $input[0].toUpperCase();
});

// modify input
hello.$hooks.pre(function($input, $inspect) {
	$input[0] = $input[0] + '!';
});

// log information + modify output if "Anna"
hello.$hooks.post(function($input, $inspect, $output) {
	console.log('hello fired with "' + $input[0] + '" name.');
	if ($input[0] === 'Anna')
		return 'Hello Bob! I mean... ' + $input[0]; // trolling, if input is "Anna"
});

hello('Anna'); // Hello Bob! I mean... Anna
hello('Nancy'); // Hello Nancy!