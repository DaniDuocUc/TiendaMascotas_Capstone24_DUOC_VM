// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
// Commented if you want to run the tests in a headless browser
process.env.CHROME_BIN = '/usr/bin/chromium-browser'

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma'),
            require('karma-junit-reporter')
        ],
        client: {
            jasmine: {
                // you can add configuration options for Jasmine here
                // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
                // for example, you can disable the random execution with `random: false`
                // or set a specific seed with `seed: 4321`
            },
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        jasmineHtmlReporter: {
            suppressAll: true // removes the duplicated traces
        },
        junitReporter: {
            outputDir: 'reports/unittest', // results will be saved as $outputDir/$browserName.xml
            outputFile: 'unittest.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
            suite: '', // suite will become the package name attribute in xml testsuite element
            useBrowserName: false, // add browser name to report and classes names
            nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
            classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
            properties: {}, // key value a pair of properties to add to the <properties> section of the report
            xmlVersion: null // use '1' if reporting to be per SonarQube 6.2 XML format
        },
        coverageReporter: {
            dir: require('path').join(__dirname, './reports/coverage'),
            subdir: '.',
            reporters: [
                {type: 'cobertura', file: 'cobertura.xml'},
                {type: 'lcovonly', file: 'lcov.info'}
            ],
            check: {
                global: {
                    statements: 15,
                    functions: 5,
                    lines: 15,
                    branches: 5
                }
            },
        },
        reporters: ['progress', 'junit', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['ChromeHeadless'], //CI
        //browsers: ['Chrome'], //LOCAL
        // Commented if you want to run the tests in a headless browser
        customLaunchers: {
            HeadlessChromium: {
                base: 'ChromiumHeadless',
                flags: [
                    '--no-sandbox',
                    '--remote-debugging-port=9222',
                    '--enable-logging',
                    '--user-data-dir=./karma-chrome',
                    '--v=1',
                    '--disable-background-timer-throttling',
                    '--disable-renderer-backgrounding',
                    '--proxy-bypass-list=*',
                    '--proxy-server=\'direct://\''
                ]
            }
        },
        singleRun: false,
        restartOnFileChange: true
    });
};
