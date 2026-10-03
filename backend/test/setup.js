// backend/test/setup.js
// Shared test configuration.
//
// Tests never touch the real database. They use MONGODB_URI_TEST, or a local
// "bello_test" database by default, and refuse to run against anything whose
// name does not contain "test".

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-only-secret";

const TEST_DB_URI = process.env.MONGODB_URI_TEST || "mongodb://127.0.0.1:27017/bello_test";

if (!/test/i.test(TEST_DB_URI.split("?")[0].split("/").pop() || "")) {
  throw new Error(`Refusing to run tests against "${TEST_DB_URI}": the database name must contain "test".`);
}

module.exports = { TEST_DB_URI };
