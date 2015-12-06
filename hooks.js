var _ = require('underscore');
var Promise = require('bluebird');
var hooksException = require('./hooksException');

function hooks() {
	
	var self = this;
	
	var private = {
		supportedTypes: ['pre', 'post'],
		hooks: {
			pre: {},
			post: {},
		},
		defaultUsePromise: false,
		log: false,
	};
	
	private.__constructor = function () {
	};
	
	/*
	 * PUBLIC MAIN METHODS
	 */
	
	self.mount = function (fn) {
		var usePromise;
		if (arguments[1] !== undefined)
			usePromise = arguments[1];
		else
			usePromise = private.defaultUsePromise;
		/*
		 * ASSIGN HOOK FUNCTIONS ON FUNCTION
		 */
		if (fn.hooks === undefined)
			fn.hooks = {
				name: fn.name,
				pre: [],
				post: [],
			};
		fn.pre = private._pre;
		fn.post = private._post;
		fn.countPre = private._countPre;
		fn.countPost = private._countPost;
		return function() {
			var args = arguments;
			return private._run(this, fn, args, usePromise);
		};
	};
	
	self.hookify = function (object) {
		var usePromise;
		if (arguments[1] !== undefined)
			usePromise = arguments[1];
		else
			usePromise = undefined;
		/*
		 * ASSIGN HOOK FUNCTIONS ON OBJECT
		 */
		object.pre = private._objPre;
		object.post = private._objPre;
		/*
		 * MOUNT HOOKS ON OBJECT FUNCTIONS
		 */
		_.each(object, function(fn, fnName){
			if (typeof fn === 'function') {
				fn.hooks = {
					name: fnName,
					pre: [],
					post: [],
				};
				object[fnName] = self.mount(fn, usePromise);
			}
		});
		return self;
	};
	
	self.setLog = function (log) {
		private.log = Boolean(log);
		return self;
	};
	
	/*
	 * PRIVATE MOUNTED FUNCTION METHODS
	 */
	
	private._pre = function (hookFn) {
		return private._setHook('pre', this, hookFn);
	};
	
	private._post = function (hookFn) {
		return private._setHook('post', this, hookFn);
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
		return private._setRegexHooks('pre', this, regexInput, hookFn);
	};
	
	private._objPost = function (regexInput, hookFn) {
		return private._setRegexHooks('post', this, regexInput, hookFn);
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
		else
			regexObject = new RegExp(regexInput);
		_.each(object, function(fn, fnName){
			if ((regexInput === undefined || fnName.match(regexObject)) && typeof fn === 'function')
				private._setHook(type, fn, hookFn);
		});
		return self;
	};
	
	private._setHook = function (type, fn, hookFn) {
		if (typeof hookFn !== 'function')
			throw new hooksException('passed ' + type + '-hook is not a function');
		fn.hooks[type].push(hookFn);
		if (private.log && window.console)
			console.info('hooks: ' + fn.name + ' function ' + type + '-hook added.')
		return self;
	};
	
	private._runPre = function (fn, args, usePromise) {
		return private._runHook('pre', fn, args, usePromise);
	};
	
	private._runPost = function (fn, args, usePromise) {
		return private._runHook('post', fn, args, usePromise);
	};
	
	private._runHook = function (type, fn, args, usePromise) {
		if (usePromise) {
			var batch = [];
			_.each(fn.hooks[type], function (hookFn, $index){
				batch.push(function(){
					return hookFn(args, fn.hooks);
				});
			})
			if (private.log && window.console)
				console.info('hooks: ' + fn.name + ' function ' + type + '-hook fired.');
			return Promise.all(batch)
					.then(function(){
						if (private.log && window.console)
							console.info('hooks: ' + fn.name + ' function ' + type + '-hook finished.')
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
					console.info('hooks: ' + fn.name + ' ' + type + '-hook (no promise) fired.');
				_.each(fn.hooks[type], function (hookFn, $index){
					hookFn(args, fn.hooks);
				});
				if (private.log && window.console)
					console.info('hooks: ' + fn.name + ' function ' + type + '-hook (no promise) finished.');
			} catch (err) {
				if (window.console) {
					console.warn('hooks exception: ' + fn.name + ' function ' + type + '-hook (no promise) failed: ' + ((typeof err === 'object' && err !== null && err.message) || 'uknown error'))
					console.error(err);
				}
				throw err;
			}
		}
	};
	
	private._run = function (context, fn) {
		var args = arguments[1];
		var usePromise = arguments[2];
		var result;
		if (usePromise)
			return private._runPre(fn, args, true)
					.then(function(){
						result = fn.apply(context, args);
						return result;
					})
					.then(function(){
						return private._runPost(fn, args, true);
					})
					.catch(function(err){
						throw err;
					});
		else {
			private._runPre(fn, args, false);
			result = fn.apply(context, args);
			private._runPost(fn, args, false);
			return result;
		}
	};

	private.__constructor.apply(self, arguments);
}

module.exports = new hooks();