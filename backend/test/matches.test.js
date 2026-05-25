// backend/test/matches.test.js
// Unit tests for Matches API endpoints
// Design Pattern: FACADE Pattern — tests validate the search and matching facade

const mongoose = require("mongoose");
require("dotenv").config();
const request = require("supertest");
const app = require("../app");

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

const testUser = {
  name: "Match Tester",
  email: `matchtest_${Date.now()}@example.com`,
  password: "Test1234!",
  confirmPassword: "Test1234!",
  country: "Thailand",
  city: "Bangkok",
  nativeLanguage: "Thai",
  timezone: "Asia/Bangkok",
  gender: "Female",
  dateOfBirth: "2000-01-01",
  learningLanguages: [{ language: "English", level: "B1" }],
};

let token = "";

describe("Matches API", () => {

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    token = res.body.token;
  });

  // Test Case 1: Get language partner matches
  it("should get language partner matches", async () => {
    const res = await request(app)
      .get("/api/matches")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  // Test Case 2: Fail to get matches without token
  it("should fail to get matches without token", async () => {
    const res = await request(app).get("/api/matches");
    expect(res.statusCode).toBe(401);
  });

  // Test Case 3: Search users by name
  it("should search users by name", async () => {
    const res = await request(app)
      .get("/api/matches/search?q=Test")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test Case 4: Search users by language
  it("should search users by language", async () => {
    const res = await request(app)
      .get("/api/matches/search?q=English")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test Case 5: Return empty array for no results
  it("should return empty array for no search results", async () => {
    const res = await request(app)
      .get("/api/matches/search?q=xyznonexistentuser99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  // Test Case 6: Return empty array for empty query
  it("should return empty array for empty query", async () => {
    const res = await request(app)
      .get("/api/matches/search?q=")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

});