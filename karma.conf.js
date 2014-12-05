// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
     // 'app/bower_components/jquery/jquery.js',
      //'app/bower_components/sass-bootstrap/dist/js/bootstrap.js',
      //'app/bower_components/angular/angular.js',
      //      'app/bower_components/angular-mocks/angular-mocks.js',
      //     'app/bower_components/angular-resource/angular-resource.js',
      //   'app/bower_components/angular-cookies/angular-cookies.js',
      //    'app/bower_components/angular-sanitize/angular-sanitize.js',
      //'app/bower_components/angular-route/angular-route.js',
      //'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      //'app/bower_components/jet/jet.js',
      'bower_components/should.js/should.js',
      'bower_components/sinonjs/sinon.js',
      'demo/jquery-1.11.1.min.js',
      'src/utils.js',
      'src/complex.js',
      'src/iirCoeffs.js',
      'src/iirFilter.js',
      'src/calcCascades.js',
      'src/firCoeffs.js',
      'src/firFilter.js',
      //            'test/mock/**/*.js',
      'spec/**/*.js'
    ],

    browserDisconnectTimeout: 20000,
    browserNoActivityTimeout: 20000,

    // list of files / patterns to exclude
   // exclude: ['test/spec/fftplot.js, test/spec/streamchief.js'],

    // web server port
    port: 8089,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    reporters: ['progress', 'coverage', 'html'],

    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
 //     'src/*.js': ['coverage'],
//      'src/**/*.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      type: 'html',
      dir: 'karma_html/coverage/'
    },

    // the default configuration
    htmlReporter: {
      outputDir: 'karma_html/report'
      //  templatePath: __dirname+'/jasmine_template.html'
    }
  });
};
