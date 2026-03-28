// backend/tests/setup.js
// test/setup.js
const mongoose = require("mongoose");
require("dotenv").config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});
