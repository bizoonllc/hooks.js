"use strict";
var _ = require('underscore');
var Promise = require('bluebird');
Promise.longStackTraces();

var hooksException = require('exception-factory').build('hooksException', 'hooks exception: ');

function hooks() {

	var $this = this, $public = this;

	$public.exception = hooksException;

	var $private = {
		supportedTypes: ['pre', 'post'],
		plugins: [],
		defaultUsePromise: false,
		log: false,
	};
	var $this_ = $private;

	$private.__constructor = function () {
	};

	/*
	 * PUBLIC MAIN METHODS
	 */

	$public.mount = function (fn) {
		/*
		 * RETURN WITHOUT ANY CHANGE IF HOOKS ALREADY MOUNTED
		 */
		if (fn.hooks !== undefined)
			return fn;
		/*
		 * USE PROMISE
		 */
		var usePromise = arguments[1] !== undefined ? arguments[1] : $this_.defaultUsePromise;
		/*
		 * CONTEXT
		 */
		var context = arguments[2] ? arguments[2] : fn;
		/*
		 * ASSIGN HOOK FUNCTIONS ON FUNCTION
		 */
		var newFn = function () {
			var args = arguments;
			return $this_._run(context, newFn, fn, args, usePromise);
		};
		newFn.hooks = newFn.$hooks = {};
		newFn.hooks.$data = {
			name: fn.$hooksFnName || fn.name,
			pre: [],
			post: [],
			property: undefined,
		};
		if (newFn.hooks.$data.name.substr(0, 3) === 'get' || newFn.hooks.$data.name.substr(0, 3) === 'set' || newFn.hooks.$data.name.substr(0, 3) === 'has') {
			var property = newFn.hooks.$data.name.substr(3);
			property = property.substr(0, 1).toLowerCase() + property.substr(1);
			newFn.hooks.$data.property = property;
		} else if (newFn.hooks.$data.name.substr(0, 4) === 'does') {
			var property = newFn.hooks.$data.name.substr(4);
			property = property.substr(0, 1).toLowerCase() + property.substr(1);
			newFn.hooks.$data.property = property;
		} else if (newFn.hooks.$data.name.substr(0, 2) === 'is' || newFn.hooks.$data.name.substr(0, 2) === 'do') {
			var property = newFn.hooks.$data.name.substr(2);
			property = property.substr(0, 1).toLowerCase() + property.substr(1);
			newFn.hooks.$data.property = property;
		}
		newFn.hooks.$fn = newFn;
		newFn.hooks.pre = newFn.hooks.before = $this_._pre;
		newFn.hooks.post = newFn.hooks.after = $this_._post;
		newFn.hooks.clean = newFn.hooks.clear = $this_._clear;
		newFn.hooks.countPre = newFn.hooks.countBefore = $this_._countPre;
		newFn.hooks.countPost = newFn.hooks.countrAfter = $this_._countPost;
		return newFn;
	};

	$public.hookify = function (object) {
		/*
		 * REGEXP
		 */
		var regexInput = arguments[1];
		if (regexInput !== undefined && regexInput !== null && typeof regexInput !== 'string' && !(regexInput instanceof RegExp))
			throw new hooksException('passed regex is not a string nor instance of RegExp object');
		var regexObject;
		if (regexInput instanceof RegExp)
			regexObject = regexInput;
		else if (regexInput === 'getters')
			regexObject = new RegExp('^get(.*?)$');
		else if (regexInput === 'setters')
			regexObject = new RegExp('^set(.*?)$');
		else if (typeof regexInput === 'string')
			regexObject = new RegExp(regexInput);
		else
			regexObject = undefined;
		/*
		 * PROMISE
		 */
		var usePromise;
		if (arguments[2] !== undefined)
			usePromise = arguments[2];
		else
			usePromise = undefined;
		/*
		 * ASSIGN HOOK FUNCTIONS ON OBJECT
		 */
		if (object.hooks === undefined)
			object.hooks = object.$hooks = {};
		object.hooks.$getters = {};
		object.hooks.$setters = {};
		object.hooks.$obj = object;
		object.hooks.pre = object.hooks.before = $this_._objPre;
		object.hooks.post = object.hooks.after = $this_._objPost;
		object.hooks.$getters.pre = object.hooks.$getters.before = function (hookFn) {
			return $this_._objPre.apply(object.hooks, ['getters', hookFn]);
		};
		object.hooks.$setters.pre = object.hooks.$setters.before = function (hookFn) {
			return $this_._objPre.apply(object.hooks, ['setters', hookFn]);
		};
		object.hooks.$getters.post = object.hooks.$getters.after = function (hookFn) {
			return $this_._objPost.apply(object.hooks, ['getters', hookFn]);
		};
		object.hooks.$setters.post = object.hooks.$setters.after = function (hookFn) {
			return $this_._objPost.apply(object.hooks, ['setters', hookFn]);
		};
		/*
		 * MOUNT HOOKS ON OBJECT FUNCTIONS
		 */
		_.each(object, function (fn, fnName) {
			if (typeof object[fnName] === 'function' && (regexObject === undefined || fnName.match(regexObject))) {
				object[fnName].$hooksFnName = fnName;
				object[fnName] = $this.mount(object[fnName], usePromise, object);
			}
		});
		return $this;
	};

	$public.plugin = function (plugin) {
		//under development
		var plugin
		$this_.plugins.push(plugin);
		$this_._objPre[pluginName] = plugin;
		$this_._objPost[pluginName] = plugin;
		return $this;
	};

	$public.createPlugin = function (name, methods) {
		//under development
		var plugin = {
			name: name,
			methods: methods,
		};
		return plugin;
	};

	$public.setLog = function (log) {
		$this_.log = Boolean(log);
		return $this;
	};

	/*
	 * PRIVATE MOUNTED FUNCTION METHODS
	 */

	$private._pre = function (hookFn) {
		$this_._setHook('pre', this.$fn, hookFn);
		return this;
	};

	$private._post = function (hookFn) {
		$this_._setHook('post', this.$fn, hookFn);
		return this;
	};

	$private._clear = function () {
		this.$data.pre = [];
		this.$data.post = [];
		return this;
	};

	$private._countPre = function () {
		return _.size(this.hooks.pre);
	};

	$private._countPost = function () {
		return _.size(this.hooks.post);
	};

	/*
	 * PRIVATE MOUNTED OBJECT METHODS
	 */

	$private._objPre = function (regexInput, hookFn) {
		return $this_._setRegexHooks('pre', this.$obj, regexInput, hookFn);
	};

	$private._objPost = function (regexInput, hookFn) {
		return $this_._setRegexHooks('post', this.$obj, regexInput, hookFn);
	};

	/*
	 * PRIVATE INTERNAL METHODS
	 */

	$private._setRegexHooks = function (type, object, regexInput, hookFn) {
		if (typeof regexInput !== 'string' && !(regexInput instanceof RegExp))
			throw new hooksException('passed regex is not a string nor instance of RegExp object');
		var regexObject;
		if (regexInput instanceof RegExp)
			regexObject = regexInput;
		else if (regexInput === 'getters')
			regexObject = new RegExp('^get(.*?)$');
		else if (regexInput === 'setters')
			regexObject = new RegExp('^set(.*?)$');
		else
			regexObject = new RegExp(regexInput);
		var countMatching = 0;
		_.each(object, function (fn, fnName) {
			if ((regexInput === undefined || fnName.match(regexObject)) && typeof fn === 'function' && fn.hooks !== undefined) {
				$this_._setHook(type, fn, hookFn);
				countMatching++;
			}
		});
		if ($this_.log && window.console)
			console.info('hooks: ' + regexObject.toString() + ' regex matched ' + countMatching + ' functions.');
		return $this;
	};

	$private._setHook = function (type, fn, hookFn) {
		if (typeof hookFn !== 'function')
			throw new hooksException('passed ' + type + '-hook is not a function');
		fn.hooks.$data[type].push(hookFn);
		if ($this_.log && window.console)
			console.info('hooks: ' + fn.name + ' function ' + type + '-hook added.')
		return $this;
	};

	$private._runPre = function (context, fn, args, usePromise) {
		return $this_._runHook('pre', context, fn, args, undefined, usePromise);
	};

	$private._runPost = function (context, fn, args, result, usePromise) {
		return $this_._runHook('post', context, fn, args, result, usePromise);
	};

	$private._runHook = function (type, context, fn, args, result, usePromise) {
		var meta = fn.hooks.$data;
		if (usePromise) {
			var promise = Promise.resolve(result);
			_.each(meta[type], function (hookFn, $index) {
				promise.then(function (output) {
					if (output !== undefined)
						result = output;
					if (type === 'post' || type === 'after')
						return hookFn.apply(context, [args, meta, result]);
					else
						return hookFn.apply(context, [args, meta]);
				});
			})
			if ($this_.log && window.console)
				console.info('hooks: ' + fn.name + ' function ' + type + '-hook fired.');
			return promise
					.then(function () {
						if ($this_.log && window.console)
							console.info('hooks: ' + fn.name + ' function ' + type + '-hook finished.')
						return result;
					})
					.catch(function (err) {
						if (window.console) {
							console.warn('hooks exception: ' + fn.name + ' function ' + type + '-hook failed: ' + ((typeof err === 'object' && err !== null && err.message) || 'uknown error'))
							console.error(err);
						}
						throw err;
					});
		} else {
			try {
				if ($this_.log && window.console)
					console.info('hooks: ' + fn.name + ' ' + type + '-hook (no promise version) fired.');
				_.each(meta[type], function (hookFn, $index) {
					if (type === 'post' || type === 'after') {
						var output = hookFn.apply(context, [args, meta, result]);
						if (output !== undefined)
							result = output;
					} else
						hookFn.apply(context, [args, meta]);
				});
				if ($this_.log && window.console)
					console.info('hooks: ' + fn.name + ' function ' + type + '-hook (no promise version) finished.');
				return result;
			} catch (err) {
				if (window.console) {
					console.warn('hooks exception: ' + fn.name + ' function ' + type + '-hook (no promise version) failed: ' + ((typeof err === 'object' && err !== null && err.message) || 'uknown error'))
					console.error(err);
				}
				throw err;
			}
		}
	};

	$private._run = function (context, parentFn, fn) {
		var args = arguments[3];
		var usePromise = arguments[4];
		var result;
		if (usePromise)
			return $this_._runPre(context, parentFn, args, true)
					.then(function () {
						result = fn.apply(context, args);
						return result;
					})
					.then(function () {
						return $this_._runPost(context, parentFn, args, result, true);
					})
					.then(function (output) {
						if (output === undefined)
							return result;
						else
							return output;
					})
					.catch(function (err) {
						throw err;
					});
		else {
			$this_._runPre(context, parentFn, args, false);
			result = fn.apply(context, args);
			var output = $this_._runPost(context, parentFn, args, result, false);
			if (output === undefined)
				return result;
			else
				return output;
		}
	};

	$private.__constructor.apply($this, arguments);
}

module.exports = new hooks();