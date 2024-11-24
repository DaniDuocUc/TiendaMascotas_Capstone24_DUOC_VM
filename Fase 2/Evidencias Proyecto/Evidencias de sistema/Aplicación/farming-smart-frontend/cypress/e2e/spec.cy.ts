describe('Uses cases for SignIn', () => {
    it('Should redirect to Scenario Selector', () => {
        cy.login();
        cy.wait(2000);
        cy.url().should('include', '/scenario-selector');
    })
    it('Should redirect to login, because the token doesnt exist', () => {
        cy.visit('/scenario-selector');
        cy.wait(2000);
        cy.url().should('include', 'sign-in');
    })
})

describe('Uses cases for ScenarioSelector', () => {
    it('Check Titles', () => {
        cy.login();
        cy.wait(2000);
        const cyTitle = cy.get('[data-cy="scenarioSelectorTitle"]');
        cyTitle.should('be.visible');
    })
    it('Should filter by search in table', () => {
        cy.login();
        cy.wait(2000);
        cy.get('.cy-search').as('search');
        cy.get('@search').should('be.visible');
        cy.get('@search').type(`test contri 4{enter}`);
        cy.wait(2000);
        // Check if the table is visible
        cy.get('.cy-table-1').as('table');
        cy.get('@table').should('be.visible');
        // Check if the row is visible
        cy.get('@table').find('tr').first().as('row');
        cy.get('@row').should('be.visible');
        cy.get('@table').then(($table) => {
            expect($table).to.have.length(1);
        });
    })
})
