
# hooks.js
[![License MIT][license]](https://opensource.org/licenses/MIT)
[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Dependencies](https://david-dm.org/bizoonllc/hooks.js.svg)](https://david-dm.org/bizoonllc/hooks.js)

Hooks library provides full support for adding pre and post hooks to independent functions and functions in objects.

## I. Installation

`npm install hooks.js --save`

Use it like this:

```
var hooks = require('hooks.js');

// Hookify!
hooks.hookify(myObject);

// set hook before function
myObject.someFunction.hooks.before(function(args, meta) {...});

// set hook after function
myObject.someFunction.hooks.after(function(args, meta, result) {...});

// now hooks are called before and after someFunction
myObject.someFunction();
```

It can be also very useful for hooking setters and getters if you don't want to put too much complex logic inside them in the class:

```
function myClass () {

  this._constructor = function() {
    hooks.hookify(this);
    this.setName.hooks.before(function(args, meta){
      if (args[0].length < 5)
        throw new Error('Name is too short');
    });
    this.setName.hooks.after(function(args, meta, result){
      return result.toUpperCase();
    });
    this.getName.hooks.before(function(args, meta){
      if (this.name === undefined)
        throw new Error('Name is undefined');
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

You can also add hooks in batch on only matching functions:

```
hooks.hookify(myObject);

myObject.hooks.before('^get(.*?)$', function(args, meta) {
  console.log('Getter fired');
});

myObject.hooks.before(new RegExp('^get(.*?)$'), function(args, meta) {
  var propertyName = meta.property;
  if (this[propertyName] === undefined)
    throw new Error(propertyName + ' property is undefined');
});

myObject.hooks.$getters.before(new RegExp(function(args, meta) {
  // Do something
});
```

To see logs of hooks actions in console, you can call `hooks.setLog(true);`.

## II. API - ASSIGN

### mount
Arguments: (@original_function:Array, @usePromise:Boolean(optional), @context:Object(optional))

```
myFunction = hooks.mount(myFunction);
```

### hookify
Arguments: (@object:Object, @regex:String||RegExp(optional), @usePromise:Boolean(optional))

```
hooks.hookify(myObject);
```

or

```
hooks.hookify(myObject, 'getters');
```

or

```
hooks.hookify(myObject, '^get(.*?)$');
```

## II. API - FUNCTION

You can use them on function on which you called first:

`myFunction = hooks.mount(myFunction);`

or

```
hooks.hookify(myObject);
var myFunction = myObject.myFunction;
```

### pre
### before
Arguments: (@prehook_callback:Function)

```
myFunction.hooks.pre(function(args, meta){
  // Something
});
// OR
myFunction.hooks.before(function(args, meta){
  // Something
});
```

### post
### after
Arguments: (@posthook_callback:Function)

```
myFunction.hooks.post(function(args, meta, result){
  // Something
});
// OR
myFunction.hooks.after(function(args, meta, result){
  // Something
});
```

### clean
Arguments: none

```
myFunction.hooks.clean();
```

## III. API - OBJECT

### pre
### before
Arguments: (@regex:String||RegExp, @prehook_callback:Function)

```
myObject.hooks.pre('^get(.*?)$', function(args, meta) {
  // Something
});
// OR
myObject.hooks.before(new RegExp('^get(.*?)$'), function(args, meta) {
  // Something
});
// OR
myObject.hooks.$getters.before(function(args, meta) {
  // Something
});
// OR
myObject.hooks.$setters.before(function(args, meta) {
  // Something
});
```

### post
### after
Arguments: (@regex:String||RegExp, @posthook_callback:Function)

```
myObject.hooks.post(new RegExp('^set(.*?)$'), function(args, meta, result) {
  // Something
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
myCustomObject.myFunction.hooks.pre(function(args, meta) {
  console.log('Do sth before');
});
myCustomObject.myOtherFunction.hooks.post(function(args, meta, result) {
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
myFunction.hooks.pre(function(args, meta) {
  console.log('Do sth before');
});

...

// Call function
myFunction('Anna');
```

## License

MIT



[npm-url]: https://npmjs.org/package/hooks.js
[npm-image]: https://img.shields.io/npm/v/hooks.js.svg
[license]: https://img.shields.io/npm/l/hooks.js.svg
[downloads-image]: https://img.shields.io/npm/dm/hooks.js.svg

