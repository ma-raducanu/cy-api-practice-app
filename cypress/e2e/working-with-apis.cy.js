/// <reference types="cypress" />

it('API Mocking', () => { // intercept has to be created before the actual call is made by the browser
  cy.intercept('GET', '**/tags', { fixture: 'tags.json'})
  cy.intercept('GET', '**/articles*', { fixture: 'articles.json' })
  cy.logIn()
})

it.only('Modify API Response', () => {
  cy.intercept('GET', '**/articles*', req => {
    req.continue(res => {
      res.body.articles[0].favoritesCount = 9999999
      res.send(res.body)
    })
  })
  cy.logIn()
  cy.get('app-favorite-button').first().should('contain.text', '9999999')
})