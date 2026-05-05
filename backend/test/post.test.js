// backend/test/posts.test.js
// Unit tests for Post API endpoints
// Design Pattern: CONTROLLER (MVC Pattern) — tests validate controller behavior

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

// Test user — must have a profile to create posts
const testUser = {
  name: "Post Tester",
  email: `posttest_${Date.now()}@example.com`,
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
let postId = "";

describe("Posts API", () => {

  // Setup: register and login to get token
  beforeAll(async () => {
    await request(app).post("/api/auth/register").send(testUser);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    token = res.body.token;
  });

  // Test Case 1: Get all posts (Feed)
  it("should get all posts", async () => {
    const res = await request(app)
      .get("/api/posts")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test Case 2: Create a new post
  it("should create a new post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Hello from test! 🌍",
        topics: ["Travel", "Food"],
        nativeLanguage: "Thai",
        learningLanguage: "English",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.text).toBe("Hello from test! 🌍");
    postId = res.body._id;
  });

  // Test Case 3: Fail to create post without token
  it("should fail to create post without token", async () => {
    const res = await request(app)
      .post("/api/posts")
      .send({ text: "Unauthorized post" });
    expect(res.statusCode).toBe(401);
  });

  // Test Case 4: Toggle like on a post
  it("should toggle like on a post", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("likes");
  });

  // Test Case 5: Add a comment to a post
  it("should add a comment to a post", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Great post!" });
    expect(res.statusCode).toBe(200);
    expect(res.body.comments.length).toBeGreaterThan(0);
  });

  // Test Case 6: Fail to add empty comment
  it("should fail to add empty comment", async () => {
    const res = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "" });
    expect(res.statusCode).toBe(400);
  });

  // Test Case 7: Update a post
  it("should update a post", async () => {
    const res = await request(app)
      .put(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Updated post text" });
    expect(res.statusCode).toBe(200);
    expect(res.body.text).toBe("Updated post text");
  });

  // Test Case 8: Delete a post
  it("should delete a post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

});