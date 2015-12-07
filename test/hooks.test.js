var expect = require('chai').expect;

var hooks = require('../hooks');

describe('hooks.js', function () {

	beforeEach(function () {
		var self = this;
	});

	afterEach(function () {
		var self = this;
	});

	it('Expect hooks.mount to not throw error when called', function () {
		var self = this;
		
		var fn = function () {
			var testFunction = function () {
			};
			testFunction = hooks.mount(testFunction);
		};
		
		expect(fn).to.not.throw(Error);
	});

	it('Expect hooks.hookify to not throw error when called', function () {
		var self = this;
		
		var fn = function () {
			var testObject = {
				testFunction: function () {
				},
				testSecondFunction: function () {
				},
			};
			hooks.hookify(testObject);
		};
		
		expect(fn).to.not.throw(Error);
	});

	it('Expect pre,post,before,after to not throw error when called on mounted function', function () {
		var self = this;
		
		var fn = function () {
			var testFunction = function () {
			};
			
			testFunction = hooks.mount(testFunction);
			
			testFunction.pre(function(){});
			testFunction.post(function(){});
			testFunction.before(function(){});
			testFunction.after(function(){});
		};
		
		expect(fn).to.not.throw(Error);
	});

	it('Expect pre,post,before,after to not throw error when called on hookified object', function () {
		var self = this;
		
		var fn = function () {
			var testObject = {
				testFunction: function () {
				},
				testSecondFunction: function () {
				},
			};
			
			hooks.hookify(testObject);
			
			testObject.pre('(.*)', function(){});
			testObject.post('(.*)', function(){});
			testObject.before('(.*)', function(){});
			testObject.after('(.*)', function(){});
		};
		
		expect(fn).to.not.throw(Error);
	});

	it('Expect pre,post,before,after to be functions mounted to chosen function', function () {
		var self = this;
		
		var testFunction = function () {
		};
		
		testFunction = hooks.mount(testFunction);
		
		expect(testFunction.pre).to.be.a('function');
		expect(testFunction.post).to.be.a('function');
		expect(testFunction.before).to.be.a('function');
		expect(testFunction.after).to.be.a('function');
	});

	it('Expect output to be sum of pre, basic and post function', function () {
		var self = this;
		
		var output = '';
		
		var testFunction = function () {
			output += ' center ';
		};
		
		testFunction = hooks.mount(testFunction);
		
		testFunction.pre(function(){
			output += 'before';
		});
		
		testFunction.post(function(){
			output += 'after';
		});
		
		testFunction();
		
		expect(output).to.be.equal('before center after');
	});

});