// Runs once before the whole test run: start from an empty test database.
const mongoose = require("mongoose");
const { TEST_DB_URI } = require("./setup");

module.exports = async () => {
  await mongoose.connect(TEST_DB_URI);
  for (const collection of await mongoose.connection.db.collections()) {
    await collection.deleteMany({});
  }
  await mongoose.disconnect();
};
