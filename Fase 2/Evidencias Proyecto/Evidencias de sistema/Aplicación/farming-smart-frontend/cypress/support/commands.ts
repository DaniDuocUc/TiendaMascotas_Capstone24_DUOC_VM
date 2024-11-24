// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
/*
declare namespace Cypress {
    interface Chainable<Subject = any> {
        customCommand(param: any): typeof customCommand;
    }
}

 function customCommand(param: any): void {
  console.warn(param);
}
 */
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import {AuthUtils} from "../../src/app/core/auth/auth.utils";


const createBody = () => {
    const decoded = AuthUtils.decodeToken(Cypress.env('login'));
    return {
        username: decoded.username,
        password: decoded.password,
        clientIp: '127.0.0.1'
    };
}


export function registerCommands(){
    // @ts-ignore
    Cypress.Commands.add('login', () => {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const url = Cypress.env('api_url') + '/api/auth/login-dev';
        cy.request({
            method: 'POST',
            url: url,
            headers: headers,
            body: createBody()
        }).then((response) => {
            window.localStorage.setItem('accessToken', response.body);
            cy.visit('/')
        });
    });
}



