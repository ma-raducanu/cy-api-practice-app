/// <reference types="cypress" />

it('API Mocking', () => { // intercept has to be created before the actual call is made by the browser
  // cy.intercept('GET', '**/tags', { fixture: 'tags.json'})
  cy.intercept({ method: 'GET', pathname: 'tags' }, { fixture: 'tags.json' }) // cleaner alternative for the above method
  cy.intercept({ method: 'GET', pathname: 'articles' }, { fixture: 'articles.json' })
  cy.logIn()
})

it('Modify API Response', () => {
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
  cy.request({
    url: 'https://conduit-api.bondaracademy.com/api/users/login',
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
      url: 'https://conduit-api.bondaracademy.com/api/articles/',
      method: 'POST',
      body: {
        "article": {
          "title": "Test Title",
          "description": "Test Description",
          "body": "Test article",
          "tagList": []
        }
      },
      headers: { 'Authorization': accessToken }
    }).then(response => {
      expect(response.status).to.equal(201)
      expect(response.body.article.title).to.equal('Test Title')
    })
  })
  cy.logIn()
  cy.contains('Test Title').click()
  cy.intercept({ method: 'GET', pathname: 'articles' }).as('articleApiCall')
  cy.contains('button', 'Delete Article').click()
  cy.wait('@articleApiCall')
  cy.get('app-article-list').should('not.contain.text', 'Test Title')
})