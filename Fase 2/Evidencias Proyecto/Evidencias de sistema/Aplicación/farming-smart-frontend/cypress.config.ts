import {defineConfig} from 'cypress'

export default defineConfig({
    'projectId': '99GBXHx',
    reporter: 'junit',
    reporterOptions: {
        mochaFile: 'cypress/reports/cypress-test.xml',
        toConsole: true,
    },
    e2e: {
        'baseUrl': 'http://localhost:4200',
        supportFile: 'cypress/support/e2e.ts',
    },


    component: {
        devServer: {
            framework: 'angular',
            bundler: 'webpack',
        },
        specPattern: '**/*.cy.ts'
    }

})
