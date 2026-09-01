const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // allowCypressEnv: false,
  env: {
    username: 'mircea.alexandru.vi.raducanu@gmail.com',
    password: 'Testing123!',
    apiUrl: 'https://conduit-api.bondaracademy.com/api'
  },
  e2e: {
    baseUrl: 'https://conduit.bondaracademy.com/',
    setupNodeEvents(on, config) {
      config.env.username = process.env.USERNAME,
      config.env.password = process.env.PASSWORD
      return config
    },
    // retries: 2 // this applies at all times
    retries: {
      openMode: 0, // this applies when opening the runner to run the tests
      runMode: 1 // this applies for headless mode, like CI/CD
    }
  },
  viewportWidth: 1920,
  viewportHeight: 1080
});
