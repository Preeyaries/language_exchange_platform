// backend/test/profile.test.js
// Unit tests for Profile API endpoints

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
  name: "Profile Tester",
  email: `profiletest_${Date.now()}@example.com`,
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
let userId = "";

describe("Profile API", () => {

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    token = res.body.token;
    userId = res.body.user?._id || res.body.user?.id;
  });

  // Test Case 1: Get own profile
  it("should get own profile", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("nativeLanguage");
  });

  // Test Case 2: Fail to get profile without token
  it("should fail to get profile without token", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.statusCode).toBe(401);
  });

  // Test Case 3: Update profile
  it("should update profile", async () => {
    const res = await request(app)
      .put("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bio: "Updated bio from test",
        city: "Chiang Mai",
        country: "Thailand",
        nativeLanguage: "Thai",
        gender: "Female",
      });
    expect(res.statusCode).toBe(200);
  });

  // Test Case 4: Get profile by user ID
  it("should get profile by user ID", async () => {
    if (!userId) return;
    const res = await request(app)
      .get(`/api/profile/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  // Test Case 5: Return 404 for non-existent profile
  it("should return 404 for non-existent profile ID", async () => {
    const res = await request(app)
      .get("/api/profile/000000000000000000000000")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

});