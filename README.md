# hooks

Hooks library provides full support for adding pre and post hooks to independent functions and functions in objects.

## I. Installation

`npm install hooks.js --save`

Use it like this:

```

// Hookify!
hooks.hookify(myObject);

...

// set hook before function
myObject.someFunction.pre(function() {...});

// set hook after function
myObject.someFunction.post(function() {...});

...

// now hooks are called before and after someFunction
myObject.someFunction();
```

It can be also very useful for hooking setters and getters if you don't want to put too much complex login inside them in the class:

```
function myClass () {

	this._constructor = function() {
		this.setName.pre(function(name){
			if (name.length < 5)
				throw new Error('Name is too short');
		});
		this.getName.pre(function(){
			if (this.name === undefined)
				throw new Error('Name is not defined');
		});
	};

	this.setName = function(name) {
		this.name = name;
		return this;
	};

	this.getName = function() {
		return this.name;
	};

}
```

You can also hookify only matching functions:

```
myObject.hoo
```

## II. API - ASSIGN

### mount
Arguments: (@original_function:Array, @usePromise:Boolean(optional))

```
myFunction = hooks.mount(myFunction);
```

### hookify
Arguments: (@object:Object, @usePromise:Boolean(optional))

```
hooks.hookify(myObject);
```

## II. API - FUNCTION

You can use them on function on which you called first:

`myFunction = hooks.mount(myFunction);`

or

```
hooks.hookify(myObject);
myObject.myFunction;
```

### pre
Arguments: (@prehook_callback:Function)

```
myFunction.pre(function(){
  // Something
});
```

### post
Arguments: (@posthook_callback:Function)

```
myFunction.post(function(){
  // Something
});
```

## III. API - OBJECT

### pre
Arguments: (@regex:String||RegExp, @posthook_callback:Function)

```
myObject.pre('^get*$', function() {
	if (this.name === undefined)
		throw new Error('Variable is undefined');
});
myObject.pre(new RegExp('^get*$'), function(name) {
	if (this.name === undefined)
		throw new Error('Variable is undefined');
});
```

### post
Arguments: (@regex:String||RegExp, @posthook_callback:Function)

```
myObject.pre(new RegExp('^set*$'), function(newValue) {
	console.log('Variable is updated');
});
```

## IV. Examples

### 1) Hookify

If you want to add hooks to all functions in the object:

```
var hooks = require('hooks.js');

...

var myCustomObject = {
  this.myFunction = function(arg1, arg2) {
  }
  this.myOtherFunction = function() {
  }
};

...

// Hookify!
hooks.hookify(myClassObj);

...

// Set custom hook actions
myCustomObject.myFunction.pre(function(arg1, arg2) {
  console.log('Do sth before');
});
myCustomObject.myOtherFunction.post(function() {
  console.log('Do sth after');
});

...

// Call functions
myClassObj.myFunction();
myClassObj.myOtherFunction();
myClassObj.myFunction();
```

### 2) Mount

If you want to add hooks to only one specified function:

```
var myFunction = function  (user_name) {
  // Something
}

...

// Mount hook to the function
myFunction = hooks.mount(myFunction);

...

// Set custom hook actions
myFunction.pre(function(user_name) {
  console.log('Do sth before');
});

...

// Call function
myFunction('Anna');
```