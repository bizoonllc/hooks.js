# hooks

Hooks library provides full support for adding pre and post hooks to independent functions and functions in objects.

##I. Installation

`npm install hooks.js --save`

Use it like this:

```
var hooks = require('hooks.js');
// hooks singleton
var globalHooks = hooks.global;
// new local instance
var localHooks = new hooks();

...

// hookify object
localHooks.hookify(myObject);

...

// set hook before function
localHooks.pre('someFunction', function() {...});

// set hook after function
localHooks.post('someFunction', function() {...});

...

// now hooks are called before and after someFunction
myObject.someFunction();
```

##II. API

###pre
Arguments: (@event_name:String, @prehook_callback:Function)

```
hooks.pre('myFunction, function(){
  // Something
});
```

###post
Arguments: (@event_name:String, @posthook_callback:Function)

```
hooks.post('myFunction, function(){
  // Something
});
```

###runPre
Arguments: (@event_name:String, @passed_arguments:Array(optional), @usePromise:Boolean(optional))

```
hooks.runPre('myFunction', ['Anna'], true);
```

###runPost
Arguments: (@event_name:String, @passed_arguments:Array(optional), @usePromise:Boolean(optional))

```
hooks.runPost('myFunction');
```

###mount
Arguments: (@event_name:String, @original_function:Array, @usePromise:Boolean(optional))

```
myFunction = hooks.mount('myFunction', myFunction);
```

###hookify
Arguments: (@object:Object, @usePromise:Boolean(optional))

```
hooks.hookify(myObject);
```

##III. Examples

### 1) Hookify

If you want to add hooks to all functions in the object:

```
var hooks = new (require('hooks.js'))();

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
hooks.pre('myFunction', function(arg1, arg2) {
  console.log('Do sth before');
});
hooks.post('myOtherFunction', function() {
  console.log('Do sth after');
});

...

// Call function
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
myFunction = hooks.mount('myFunction', myFunction);

...

// Set custom hook actions
hooks.pre('myFunction', function(user_name) {
  console.log('Do sth before');
});

...

// Call function
myFunction('Anna');
```

### 3) Set running hooks manually

You set places where to call hooks and with what arguments:

```
function myFunction () {
  hooks.runPre('myFunction', ['some_argument', 'some_other_argument']);
  // some action inside
  hooks.runPost('myFunction');
}

...

// Set custom hook actions
hooks.pre('myFunction', function(some_argument, some_other_argument) {
  console.log('Do sth before');
});

...

// Call function
myClassObj.myFunction();
```

