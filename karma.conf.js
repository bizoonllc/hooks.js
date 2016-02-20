module.exports = function (config) {
	config.set({
		basePath: './',
		plugins: [
			'karma-chai',
			'karma-mocha',
			'karma-sinon',
			'karma-browserify',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-opera-launcher',
			'karma-safari-launcher',
			'karma-ie-launcher',
			'sinon-chai',
		],
		frameworks: [
			'mocha',
			'chai',
			'sinon',
			'browserify',
		],
		browsers: [
			'Chrome',
			'Firefox',
			'Opera',
			'OperaClassic',
			'Safari',
			'IE',
			'IE8',
			'IE9',
			'IE10'
		],
		customLaunchers: {
			IE8: {
				base: 'IE',
				'x-ua-compatible': 'IE=EmulateIE8'
			},
			IE9: {
				base: 'IE',
				'x-ua-compatible': 'IE=EmulateIE9'
			},
			IE10: {
				base: 'IE',
				'x-ua-compatible': 'IE=EmulateIE10'
			},
		},
		files: [
			'./test/*.test.js',
		],
		preprocessors: {
			'./test/*.test.js': ['browserify']
		},
		browserify: {
			debug: true,
			transform: ['brfs']
		},
		client: {
			captureConsole: true,
		},
		port: 9876,
		colors: true,
		autoWatch: true,
		logLevel: config.LOG_INFO

	});
};
