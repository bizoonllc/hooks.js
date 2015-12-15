var _ = require('underscore');
var Promise = require('bluebird');
Promise.longStackTraces();
var hooksException = require('./hooksException');

function hooks() {
	
	var self = this;
	
	var private = {
		supportedTypes: ['pre', 'post'],
		plugins: [],
		defaultUsePromise: false,
		log: false,
	};
	
	private.__constructor = function () {
	};
	
	/*
	 * PUBLIC MAIN METHODS
	 */
	
	self.mount = function (fn) {
		/*
		 * RETURN WITHOUT ANY CHANGE IF HOOKS ALREADY MOUNTED
		 */
		if (fn.hooks !== undefined)
			return fn;
		var usePromise;
		if (arguments[1] !== undefined)
			usePromise = arguments[1];
		else
			usePromise = private.defaultUsePromise;
		/*
		 * ASSIGN HOOK FUNCTIONS ON FUNCTION
		 */
		var newFn = function() {
			var args = arguments;
			return private._run(this, newFn, fn, args, usePromise);
		};
		newFn.hooks = {};
		newFn.hooks.$data = {
			name: fn.$hooksFnName || fn.name,
			pre: [],
			post: [],
			property: undefined,
		};
		if (newFn.hooks.$data.name.substr(0,3) === 'get' || newFn.hooks.$data.name.substr(0,3) === 'set') {
			var property = newFn.hooks.$data.name.substr(3);
			property = property.substr(0,1).toLowerCase() + property.substr(1);
			newFn.hooks.$data.property = property;
		}
		newFn.hooks.$fn = newFn;
		newFn.hooks.pre = newFn.hooks.before = private._pre;
		newFn.hooks.post = newFn.hooks.after = private._post;
		newFn.hooks.clean = private._clean;
		newFn.hooks.countPre = newFn.hooks.countBefore = private._countPre;
		newFn.hooks.countPost = newFn.hooks.countrAfter = private._countPost;
		return newFn;
	};
	
	self.hookify = function (object) {
		/*
		 * REGEXP
		 */
		var regexInput = arguments[1];
		if (regexInput !== undefined && regexInput !== null && typeof regexInput !== 'string' && !(regexInput instanceof RegExp))
			throw new hooksException('passed regex is not a string or instance of RegExp object');
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
			object.hooks = {};
		object.hooks.$getters = {};
		object.hooks.$setters = {};
		object.hooks.$obj = object;
		object.hooks.pre = object.hooks.before = private._objPre;
		object.hooks.post = object.hooks.after = private._objPost;
		object.hooks.$getters.pre = object.hooks.$getters.before = function(hookFn){
			return private._objPre.apply(object.hooks, ['getters', hookFn]);
		};
		object.hooks.$setters.pre = object.hooks.$setters.before = function(hookFn){
			return private._objPre.apply(object.hooks, ['setters', hookFn]);
		};
		object.hooks.$getters.post = object.hooks.$getters.after = function(hookFn){
			return private._objPost.apply(object.hooks, ['getters', hookFn]);
		};
		object.hooks.$setters.post = object.hooks.$setters.after = function(hookFn){
			return private._objPost.apply(object.hooks, ['setters', hookFn]);
		};
		/*
		 * MOUNT HOOKS ON OBJECT FUNCTIONS
		 */
		_.each(object, function(fn, fnName){
			if (typeof object[fnName] === 'function' && (regexObject === undefined || fnName.match(regexObject))) {
				object[fnName].$hooksFnName = fnName;
				object[fnName] = self.mount(object[fnName], usePromise);
			}
		});
		return self;
	};
	
	self.plugin = function (plugin) {
		//under development
		var plugin
		private.plugins.push(plugin);
		private._objPre[pluginName] = plugin;
		private._objPost[pluginName] = plugin;
		return self;
	};
	
	self.createPlugin = function (name, methods) {
		//under development
		var plugin = {
			name: name,
			methods: methods,
		};
		return plugin;
	};
	
	self.setLog = function (log) {
		private.log = Boolean(log);
		return self;
	};
	
	/*
	 * PRIVATE MOUNTED FUNCTION METHODS
	 */
	
	private._pre = function (hookFn) {
		private._setHook('pre', this.$fn, hookFn);
		return this;
	};
	
	private._post = function (hookFn) {
		private._setHook('post', this.$fn, hookFn);
		return this;
	};
	
	private._clean = function () {
		this.$data.pre = [];
		this.$data.post = [];
		return this;
	};
	
	private._countPre = function () {
		return _.size(this.hooks.pre);
	};
	
	private._countPost = function () {
		return _.size(this.hooks.post);
	};
	
	/*
	 * PRIVATE MOUNTED OBJECT METHODS
	 */
	
	private._objPre = function (regexInput, hookFn) {
		return private._setRegexHooks('pre', this.$obj, regexInput, hookFn);
	};
	
	private._objPost = function (regexInput, hookFn) {
		return private._setRegexHooks('post', this.$obj, regexInput, hookFn);
	};
	
	/*
	 * PRIVATE INTERNAL METHODS
	 */
	
	private._setRegexHooks = function(type, object, regexInput, hookFn) {
		if (typeof regexInput !== 'string' && !(regexInput instanceof RegExp))
			throw new hooksException('passed regex is not a string or instance of RegExp object');
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
		_.each(object, function(fn, fnName){
			if ((regexInput === undefined || fnName.match(regexObject)) && typeof fn === 'function' && fn.hooks !== undefined) {
				private._setHook(type, fn, hookFn);
				countMatching++;
			}
		});
		if (private.log && window.console)
			console.info('hooks: ' + regexObject.toString() + ' regex matched ' + countMatching + ' functions.');
		return self;
	};
	
	private._setHook = function (type, fn, hookFn) {
		if (typeof hookFn !== 'function')
			throw new hooksException('passed ' + type + '-hook is not a function');
		fn.hooks.$data[type].push(hookFn);
		if (private.log && window.console)
			console.info('hooks: ' + fn.name + ' function ' + type + '-hook added.')
		return self;
	};
	
	private._runPre = function (fn, args, usePromise) {
		return private._runHook('pre', fn, args, undefined, usePromise);
	};
	
	private._runPost = function (fn, args, result, usePromise) {
		return private._runHook('post', fn, args, result, usePromise);
	};
	
	private._runHook = function (type, fn, args, result, usePromise) {
		var meta = fn.hooks.$data;
		if (usePromise) {
			var promise = Promise.resolve(result);
			_.each(meta[type], function (hookFn, $index){
				promise.then(function(output){
					if (output !== undefined)
						result = output;
					if (type === 'post')
						return hookFn(args, meta, result);
					else
						return hookFn(args, meta);
				});
			})
			if (private.log && window.console)
				console.info('hooks: ' + fn.name + ' function ' + type + '-hook fired.');
			return promise
					.then(function(){
						if (private.log && window.console)
							console.info('hooks: ' + fn.name + ' function ' + type + '-hook finished.')
						return result;
					})
					.catch(function(err){
						if (window.console) {
							console.warn('hooks exception: ' + fn.name + ' function ' + type + '-hook failed: ' + ((typeof err === 'object' && err !== null && err.message) || 'uknown error'))
							console.error(err);
						}
						throw err;
					});
		} else {
			try {
				if (private.log && window.console)
					console.info('hooks: ' + fn.name + ' ' + type + '-hook (no promise version) fired.');
				_.each(meta[type], function (hookFn, $index){
					if (type === 'post') {
						var output = hookFn(args, meta, result);
						if (output !== undefined)
							result = output;
					} else
						hookFn(args, meta);
				});
				if (private.log && window.console)
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
	
	private._run = function (context, parentFn, fn) {
		var args = arguments[3];
		var usePromise = arguments[4];
		var result;
		if (usePromise)
			return private._runPre(parentFn, args, true)
					.then(function(){
						result = fn.apply(context, args);
						return result;
					})
					.then(function(){
						return private._runPost(parentFn, args, result, true);
					})
					.then(function(output){
						if (output === undefined)
							return result;
						else
							return output;
					})
					.catch(function(err){
						throw err;
					});
		else {
			private._runPre(parentFn, args, false);
			result = fn.apply(context, args);
			var output = private._runPost(parentFn, args, result, false);
			if (output === undefined)
				return result;
			else
				return output;
		}
	};

	private.__constructor.apply(self, arguments);
}

module.exports = new hooks();