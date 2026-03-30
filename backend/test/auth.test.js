// backend/tests/auth.test.js
const mongoose = require("mongoose");
require("dotenv").config();
const request = require("supertest");
const app = require("../app");

// Connect to MongoDB before all tests run
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

// Close MongoDB connection after all tests finish
afterAll(async () => {
  await mongoose.connection.close();
});

// Test user data used across all test cases
// Uses Date.now() to ensure unique email on every test run
const testUser = {
  name: "Test User",
  email: `test_${Date.now()}@example.com`,
  password: "Test1234!",
  confirmPassword: "Test1234!",
  country: "Thailand",
  city: "Bangkok",
  nativeLanguage: "Thai",
  timezone: "Asia/Bangkok",
};

// Stores JWT token after login, shared across test cases
let token = "";

describe("Auth API", () => {

  // Test Case 1: Registration
  // Sends valid user data to POST /api/auth/register
  // Expects HTTP 201 Created and a user object in the response body
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("user");
  });

  // Test Case 2: Successful Login
  // Sends correct email & password to POST /api/auth/login
  // Expects HTTP 200 OK and a JWT token in the response body
  // Saves the token for use in subsequent authenticated tests
  it("should login with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  // Test Case 3: Failed Login (Wrong Password)
  // Sends correct email but wrong password to POST /api/auth/login
  // Expects HTTP 401 Unauthorized — authentication should be rejected
  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });
    expect(res.statusCode).toBe(401);
  });

  // Test Case 4: Get Current User (Authenticated)
  // Sends GET /api/auth/me with a valid Bearer token in the Authorization header
  // Expects HTTP 200 OK and the response email to match the logged-in user
  it("should get current user with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
  });

  // Test Case 5: Get Current User (Unauthenticated)
  // Sends GET /api/auth/me with no Authorization header
  // Expects HTTP 401 Unauthorized — protected route should block unauthenticated requests
  it("should fail to get user without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

});