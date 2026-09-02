declare namespace Cypress {
  interface Chainable {
    /**
     * Opens the home page of the application.
     */
    logInToApplication(): Chainable<void>
  }
}