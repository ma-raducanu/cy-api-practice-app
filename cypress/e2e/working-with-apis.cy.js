/// <reference types="cypress" />

it('First test', () => { // intercept has to be created before the actual call is made by the browser
  cy.intercept('GET', '**/tags', { fixture: 'tags.json'})
  cy.intercept('GET', '**/articles*', { fixture: 'articles.json' })
  cy.logIn()
})