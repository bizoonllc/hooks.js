var expect = require('chai').expect;

var hooks = require('../src/hooks');

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

	it('Expect output to be converted to upper case by post hook', function () {
		var self = this;
		
		var testFunction = function () {
			return 'Anna';
		};
		
		testFunction = hooks.mount(testFunction);
		
		testFunction.post(function(args, meta, result){
			return result.toUpperCase();
		});
		
		var output = testFunction();
		
		expect(output).to.be.equal('ANNA');
	});

	it('Expect output to not be overwritten by post hook if undefined returned', function () {
		var self = this;
		
		var testFunction = function () {
			return 'Anna';
		};
		
		testFunction = hooks.mount(testFunction);
		
		testFunction.post(function(args, meta, result){
			return undefined;
		});
		
		var output = testFunction();
		
		expect(output).to.be.equal('Anna');
	});

	it('Expect output to be overwritten by post hook if null returned', function () {
		var self = this;
		
		var testFunction = function () {
			return 'Anna';
		};
		
		testFunction = hooks.mount(testFunction);
		
		testFunction.post(function(args, meta, result){
			return null;
		});
		
		var output = testFunction();
		
		expect(output).to.be.equal(null);
	});

	it('Expect output to be correctly overwritten by post hooks where some of them modify output and some of them don\'t', function () {
		var self = this;
		
		var testFunction = function () {
			return 'Anna';
		};
		
		testFunction = hooks.mount(testFunction);
		
		testFunction.post(function(args, meta, result){
			return '@' + result;
		});
		
		testFunction.post(function(args, meta, result){
			return undefined;
		});
		
		testFunction.post(function(args, meta, result){
			return result.toUpperCase();
		});
		
		testFunction.post(function(args, meta, result){
		});
		
		var output = testFunction();
		
		expect(output).to.be.equal('@ANNA');
	});

	it('Expect output to not be modified by hooks after clean function was called', function () {
		var self = this;
		
		var testFunction = function () {
			return 'Anna';
		};
		
		testFunction = hooks.mount(testFunction);
		
		testFunction.post(function(args, meta, result){
			return result.toUpperCase();
		});
		
		testFunction.clean();
		
		var output = testFunction();
		
		expect(output).to.be.equal('Anna');
	});

	it('Expect input to be modified by hooks', function () {
		var self = this;
		
		var testFunction = function (name) {
			return name;
		};
		
		testFunction = hooks.mount(testFunction);
		
		testFunction.pre(function(args, meta){
			args[0] = args[0].toUpperCase();
		});
		
		expect(testFunction('Anna')).to.be.equal('ANNA');
	});

	it('Expect meta name to be the name of the function', function () {
		var self = this;
		
		var nameOfTheFunction = undefined;
		
		function testFunction () {
			return 'Anna';
		};
		
		testFunction = hooks.mount(testFunction);
		
		testFunction.pre(function(args, meta){
			nameOfTheFunction = meta.name;
		});
		
		testFunction();
		
		expect(nameOfTheFunction).to.be.equal('testFunction');
	});

	it('Expect hits to be called 2 times on regex hook', function () {
		var self = this;
		
		var testObject = {
			name: 'Anna',
			surname: 'Smith',
			getName: function() {
				return this.name;
			},
			getSurname: function() {
				return this.surname;
			},
			setName: function(name) {
				this.name = name;
				return this;
			},
			setSurname: function(surname) {
				this.surname = surname;
				return this;
			},
		};
		
		hooks.hookify(testObject);
		
		var hits = 0;
		
		testObject.pre('^get(.*?)$', function(args, meta){
			hits++;
			console.log(meta);
		})
		
		testObject.getName();
		testObject.getSurname();
		testObject.setName('Anna');
		testObject.setSurname('Smith');
		
		expect(hits).to.be.equal(2);
	});

});