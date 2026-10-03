// backend/jest.config.js
module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  testMatch: ["**/test/**/*.test.js"],
  setupFiles: ["<rootDir>/test/setup.js"],
  globalSetup: "<rootDir>/test/globalSetup.js",
};
