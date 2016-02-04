module.exports = function (config) {
	config.set({
		basePath: './',
		plugins: [
			'karma-chai',
			'karma-mocha',
			'karma-sinon',
			'karma-browserify',
			'karma-chrome-launcher',
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
		],
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
