var _ = require('underscore');
var Promise = require('bluebird');

function hooks() {
	
	var self = this;
	
	var private = {
		supportedTypes: ['pre', 'post'],
		hooks: {
			pre: {},
			post: {},
		},
		log: false,
	};
	
	private.__constructor = function () {
	};
	
	/*
	 * PUBLIC MAIN METHODS
	 */
	
	self.pre = function (fnName, fn) {
		return private._setHook('pre', fnName, fn);
	};
	
	self.post = function (fnName, fn) {
		return private._setHook('post', fnName, fn);
	};
	
	self.runPre = function (fnName) {
		return private._runHook('pre', fnName, arguments[1] || undefined, arguments[2] || true);
	};
	
	self.runPost = function (fnName) {
		return private._runHook('post', fnName, arguments[1] || undefined, arguments[2] || true);
	};
	
	self.run = function (fnName, fn) {
		var args = arguments[2];
		var usePromise = arguments[3];
		var result;
		if (usePromise)
			return self.runPre(fnName, args, true)
					.then(function(){
						result = fn.apply(fn, args);
						return result;
					})
					.then(function(){
						return self.runPost(fnName, args, true);
					})
					.catch(function(err){
						throw err;
					});
		else {
			self.runPre(fnName, args, false);
			result = fn.apply(fn, args);
			self.runPost(fnName, args, false);
			return result;
		}
	};
	
	self.mount = function (fnName, fn) {
		var usePromise = arguments[1] || true;
		return function() {
			var args = arguments;
			return self.run(fnName, fn, args, usePromise);
		};
	};
	
	self.hookify = function (object) {
		_.each(object, function(fn, fnName){
			if (typeof fn === 'function')
				self.mount(fnName, fn);
		});
		return self;
	};
	
	/*
	 * PUBLIC ADDITIONAL METHODS
	 */
	
	self.isPre = function (fnName) {
		return _.size(private.hooks.pre[fnName]) > 0;
	};
	
	self.isPost = function (fnName) {
		return _.size(private.hooks.post[fnName]) > 0;
	};
	
	self.list = function (type) {
		if (private.supportedTypes.indexOf(type) === -1)
			throw new Error('hooks exception: this type of hook (' + type + ') is not supported');
		var list = {};
		_.each(private.hooks[type], function(hookFns, hookEvent){
			list[hookEvent] = _.size(hookFns);
		});
		return private.hooks[type];
	};
	
	self.setLog = function (log) {
		private.log = Boolean(log);
		return self;
	};
	
	/*
	 * PRIVATE INTERNAL METHODS
	 */
	
	private._setHook = function (type, fnName, fn) {
		if (typeof fnName !== 'string')
			throw new Error('hooks exception: passed first argument is not a string');
		if (typeof fn !== 'function')
			throw new Error('hooks exception: passed second argument is not a function');
		if (private.hooks[type][fnName] === undefined)
			private.hooks[type][fnName] = [];
		private.hooks[type][fnName].push(fn);
		if (private.log && window.console)
			console.info('hooks: ' + fnName + ' function ' + type + '-hook added.')
		return self;
	};
	
	private._runHook = function (type, fnName, args, usePromise) {
		if (usePromise) {
			var batch = [];
			_.each(private.hooks[type][fnName], function (hookFn, $index){
				batch.push(function(){
					return hookFn.apply(hooks, args);
				});
			})
			if (private.log && window.console)
				console.info('hooks: ' + fnName + ' function ' + type + '-hook fired.');
			return Promise.all(batch)
					.then(function(){
						if (private.log && window.console)
							console.info('hooks: ' + fnName + ' function ' + type + '-hook finished.')
					})
					.catch(function(err){
						if (window.console) {
							console.warn('hooks exception: ' + fnName + ' function ' + type + '-hook failed: ' + ((typeof err === 'object' && err !== null && err.message) || 'uknown error'))
							console.error(err);
						}
						throw err;
					});
		} else {
			try {
				if (private.log && window.console)
					console.info('hooks: ' + fnName + ' ' + type + '-hook (no promise) fired.');
				_.each(private.hooks[type][fnName], function (hookFn, $index){
					hookFn.apply(hooks, args);
				});
				if (private.log && window.console)
					console.info('hooks: ' + fnName + ' function ' + type + '-hook (no promise) finished.');
			} catch (err) {
				if (window.console) {
					console.warn('hooks exception: ' + fnName + ' function ' + type + '-hook (no promise) failed: ' + ((typeof err === 'object' && err !== null && err.message) || 'uknown error'))
					console.error(err);
				}
				throw err;
			}
		}
	};

	private.__constructor.apply(self, arguments);
}

module.exports = hooks;