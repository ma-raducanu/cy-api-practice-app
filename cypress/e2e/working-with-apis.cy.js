/// <reference types="cypress" />
import { faker } from '@faker-js/faker'

it('API Mocking', () => { // intercept has to be created before the actual call is made by the browser
  // cy.intercept('GET', '**/tags', { fixture: 'tags.json'})
  cy.intercept({ method: 'GET', pathname: 'tags' }, { fixture: 'tags.json' }) // cleaner alternative for the above method
  cy.intercept({ method: 'GET', pathname: 'articles' }, { fixture: 'articles.json' })
  cy.logIn()
})

it('Modify API Response', {retries: 2}, () => {
  cy.intercept({ method: 'GET', pathname: 'articles' }, req => {
    req.continue(res => {
      res.body.articles[0].favoritesCount = 9999999
      res.send(res.body)
    })
  })
  cy.logIn()
  cy.get('app-favorite-button').first().should('contain.text', '9999999')
})

it('Waiting for APIs', () => {
  cy.intercept({ method: 'GET', pathname: 'articles' }).as('articleApiCall')
  cy.logIn()
  cy.wait('@articleApiCall').then(apiArticleObject => {
    // console.log(apiArticleObject)
    expect(apiArticleObject.response.body.articles[0].title).to.contain('Bondar Academy')
  })
  // cy.get('app-article-list').should('contain.text', 'Bondar Academy')
  cy.get('app-article-list').invoke('text').then(allArticleTexts => { // this assertion will fail because invoke will assert the text which comes first, which in this case is "Loading articles...", so you need to add a dynamic wait before asserting
    expect(allArticleTexts).to.contain('Bondar Academy')
  })
})

it.only('Delete an article', () => {
  cy.logIn()
  const titleOfTheArticle = faker.person.fullName()
  cy.get('@accessToken').then(accessToken => {
    cy.request({
      url: `${Cypress.env('apiUrl')}/articles/`,
      method: 'POST',
      body: {
        "article": {
          "title": titleOfTheArticle,
          "description": faker.person.jobTitle(),
          "body": faker.lorem.paragraph(10),
          "tagList": []
        }
      },
      headers: { 'Authorization': `Token ${accessToken}` }
    }).then(response => {
      expect(response.status).to.equal(201)
      expect(response.body.article.title).to.equal(titleOfTheArticle)
    })
  })
  cy.contains(titleOfTheArticle).click()
  cy.intercept({ method: 'GET', pathname: 'articles' }).as('articleApiCall')
  cy.contains('button', 'Delete Article').click()
  cy.wait('@articleApiCall')
  cy.get('app-article-list').should('not.contain.text', titleOfTheArticle)
})

it('E2E API Test', () => {
  cy.request({
    url: `${Cypress.env('apiUrl')}/users/login`,
    method: 'POST',
    body: {
      "user": {
        "email": "mircea.alexandru.vi.raducanu@gmail.com",
        "password": "Testing123!"
      }
    }
  }).then(response => {
    expect(response.status).to.equal(200)
    const getAccessToken = response.body.user.token
    const accessToken = `Token ${getAccessToken}`
    cy.request({
      url: `${Cypress.env('apiUrl')}/articles/`,
      method: 'POST',
      body: {
        "article": {
          "title": "E2E API Test",
          "description": "Test description",
          "body": "Test article",
          "tagList": []
        }
      },
      headers: { 'Authorization': accessToken }
    }).then(response => {
      expect(response.status).to.equal(201)
      expect(response.body.article.title).to.equal('E2E API Test')
    })
    cy.request({
      url: `${Cypress.env('apiUrl')}/articles?limit=1&offset=0`,
      method: 'GET',
      headers: { 'Authorization': accessToken }
    }).then(response => {
      expect(response.status).to.equal(200)
      expect(response.body.articles[0].title).to.equal('E2E API Test')
      const slugId = response.body.articles[0].slug
      cy.request({
        url: `${Cypress.env('apiUrl')}/articles/${slugId}`,
        method: 'DELETE',
        headers: { 'Authorization': accessToken }
      }).then(response => {
        expect(response.status).to.equal(204)
      })
    })
    cy.request({
      url: `${Cypress.env('apiUrl')}/articles?limit=1&offset=0`,
      method: 'GET',
      headers: { 'Authorization': accessToken }
    }).then(response => {
      expect(response.status).to.equal(200)
      expect(response.body.articles[0].title).to.not.equal('E2E API Test')
    })
  })
})