// backend/test/security.test.js
// Access control and data protection tests: what one user must not be able
// to do to another, and what the API must not reveal.

const mongoose = require("mongoose");
const { TEST_DB_URI } = require("./setup");
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Post = require("../models/Post");
const Profile = require("../models/Profile");

const stamp = Date.now();
const makeUser = (tag, extra = {}) => ({
  name: `Sec ${tag}`,
  email: `sec_${tag}_${stamp}@example.com`,
  password: "Test1234!",
  confirmPassword: "Test1234!",
  country: "Thailand",
  city: "Bangkok",
  nativeLanguage: "Thai",
  gender: "Female",
  dateOfBirth: "2000-01-01",
  learningLanguages: [{ language: "English", level: "B1" }],
  ...extra,
});

async function signUp(data) {
  const reg = await request(app).post("/api/auth/register").send(data);
  const login = await request(app).post("/api/auth/login").send({ email: data.email, password: data.password });
  return { id: reg.body.user.id, token: login.body.token, email: data.email };
}
const as = (user) => ({ Authorization: `Bearer ${user.token}` });

let alice, bob, admin, postId;

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
  alice = await signUp(makeUser("alice"));
  bob = await signUp(makeUser("bob", { nativeLanguage: "English", learningLanguages: [{ language: "Thai", level: "A2" }] }));
  admin = await signUp(makeUser("admin"));
  await User.updateOne({ _id: admin.id }, { $set: { role: "admin" } });

  const post = await request(app).post("/api/posts").set(as(alice)).send({ text: "Alice's post" });
  postId = post.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Registration and login", () => {
  it("rejects a short password", async () => {
    const res = await request(app).post("/api/auth/register")
      .send(makeUser("short", { password: "abc", confirmPassword: "abc" }));
    expect(res.statusCode).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send(makeUser("bademail", { email: "not-an-email" }));
    expect(res.statusCode).toBe(400);
  });

  it("cannot register as admin by sending a role", async () => {
    const data = makeUser("wannabe", { role: "admin" });
    await request(app).post("/api/auth/register").send(data);
    const user = await User.findOne({ email: data.email });
    expect(user.role).toBe("user");
  });

  it("stores the date of birth and never stores the plain password", async () => {
    const user = await User.findById(alice.id);
    const profile = await Profile.findOne({ user: alice.id });
    expect(user.passwordHash).not.toContain("Test1234!");
    expect(profile.dateOfBirth).toBeInstanceOf(Date);
  });

  it("does not crash on a non-string email (query injection attempt)", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: { $gt: "" }, password: "x" });
    expect(res.statusCode).toBe(400);
  });
});

describe("Privacy", () => {
  it("requires a token to read the feed", async () => {
    expect((await request(app).get("/api/posts")).statusCode).toBe(401);
  });

  it("never includes email addresses in the feed", async () => {
    const res = await request(app).get("/api/posts").set(as(bob));
    expect(res.statusCode).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain("@example.com");
    const post = res.body.find((p) => p._id === postId);
    expect(post.author.handle).toBe(alice.email.split("@")[0]);
    expect(post.author.gender).toBe("Female");
  });

  it("hides email and date of birth on another user's profile", async () => {
    const res = await request(app).get(`/api/profile/${alice.id}`).set(as(bob));
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBeUndefined();
    expect(res.body.dateOfBirth).toBeUndefined();
    expect(res.body.ageRange).toBeTruthy();
    expect(res.body.user.followers).toBeUndefined();
  });

  it("shows the email to an admin (needed by the admin edit screen)", async () => {
    const res = await request(app).get(`/api/profile/${alice.id}`).set(as(admin));
    expect(res.body.user.email).toBe(alice.email);
  });

  it("never includes email addresses in match or search results", async () => {
    const matches = await request(app).get("/api/matches").set(as(alice));
    const search = await request(app).get("/api/matches/search?q=Sec").set(as(alice));
    expect(matches.body.some((m) => m._id === bob.id)).toBe(true);
    expect(search.body.length).toBeGreaterThan(0);
    expect(JSON.stringify([matches.body, search.body])).not.toContain("@example.com");
  });
});

describe("Ownership", () => {
  it("does not let a user edit or delete someone else's post", async () => {
    const edit = await request(app).put(`/api/posts/${postId}`).set(as(bob)).send({ text: "Hacked" });
    const del = await request(app).delete(`/api/posts/${postId}`).set(as(bob));
    expect(edit.statusCode).toBe(404);
    expect(del.statusCode).toBe(404);
    expect((await Post.findById(postId)).text).toBe("Alice's post");
  });

  it("ignores protected fields when updating a post", async () => {
    const res = await request(app).put(`/api/posts/${postId}`).set(as(alice))
      .send({ text: "Edited", likes: 9999, author: bob.id, isDeleted: true, likedBy: [bob.id] });
    expect(res.statusCode).toBe(200);
    const post = await Post.findById(postId);
    expect(post.text).toBe("Edited");
    expect(post.likes).toBe(0);
    expect(String(post.author)).toBe(alice.id);
    expect(post.isDeleted).toBe(false);
  });

  it("does not let a profile update change which user the profile belongs to", async () => {
    await request(app).put("/api/profile").set(as(bob)).send({ user: alice.id, bio: "Bob's bio" });
    const profile = await Profile.findOne({ bio: "Bob's bio" });
    expect(String(profile.user)).toBe(bob.id);
  });

  it("counts each user's like once", async () => {
    const first = await request(app).post(`/api/posts/${postId}/like`).set(as(bob));
    expect(first.body).toEqual({ likes: 1, liked: true });
    const second = await request(app).post(`/api/posts/${postId}/like`).set(as(bob));
    expect(second.body).toEqual({ likes: 0, liked: false });
  });

  it("only lets the comment author delete a comment", async () => {
    const added = await request(app).post(`/api/posts/${postId}/comments`).set(as(alice)).send({ text: "mine" });
    const commentId = added.body.comments[0]._id;
    await request(app).delete(`/api/posts/${postId}/comments/${commentId}`).set(as(bob));
    expect((await Post.findById(postId)).comments.length).toBe(1);
  });
});

describe("Messages and follows", () => {
  it("sends a message and only the two people in it can read it", async () => {
    const sent = await request(app).post(`/api/messages/${bob.id}`).set(as(alice)).send({ text: "Hi Bob" });
    expect(sent.statusCode).toBe(201);
    const bobView = await request(app).get(`/api/messages/${alice.id}`).set(as(bob));
    expect(bobView.body.map((m) => m.text)).toContain("Hi Bob");
    const adminView = await request(app).get(`/api/messages/${alice.id}`).set(as(admin));
    expect(adminView.body).toEqual([]);
  });

  it("rejects messages to unknown users, to yourself, and with non-http media links", async () => {
    const ghost = new mongoose.Types.ObjectId();
    expect((await request(app).post(`/api/messages/${ghost}`).set(as(alice)).send({ text: "x" })).statusCode).toBe(404);
    expect((await request(app).post(`/api/messages/${alice.id}`).set(as(alice)).send({ text: "x" })).statusCode).toBe(400);
    expect((await request(app).post(`/api/messages/${bob.id}`).set(as(alice))
      .send({ imageUrl: "javascript:alert(1)" })).statusCode).toBe(400);
  });

  it("follows and unfollows", async () => {
    await request(app).post(`/api/follow/${bob.id}`).set(as(alice));
    expect((await request(app).get(`/api/follow/status/${bob.id}`).set(as(alice))).body.isFollowing).toBe(true);
    await request(app).delete(`/api/follow/${bob.id}`).set(as(alice));
    expect((await request(app).get(`/api/follow/status/${bob.id}`).set(as(alice))).body.isFollowing).toBe(false);
  });
});

describe("Input handling", () => {
  it("returns 400 for a malformed id instead of a server error", async () => {
    for (const url of ["/api/profile/abc", "/api/posts/abc", "/api/messages/abc", "/api/follow/status/abc"]) {
      expect((await request(app).get(url).set(as(alice))).statusCode).toBe(400);
    }
  });

  it("treats search text literally, not as a regular expression", async () => {
    const all = await request(app).get("/api/matches/search?q=" + encodeURIComponent(".*")).set(as(alice));
    expect(all.body).toEqual([]);
    const bad = await request(app).get("/api/matches/search?q=" + encodeURIComponent("(")).set(as(alice));
    expect(bad.statusCode).toBe(200);
  });

  it("returns JSON 404 for unknown routes and 400 for broken JSON", async () => {
    expect((await request(app).get("/api/nope")).statusCode).toBe(404);
    const res = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send("{bad");
    expect(res.statusCode).toBe(400);
  });
});

describe("Reports and admin", () => {
  it("lets a user report a post and an admin read the report", async () => {
    const report = await request(app).post("/api/reports").set(as(bob)).send({ reportedPost: postId, reason: "spam" });
    expect(report.statusCode).toBe(201);
    expect((await request(app).get("/api/admin/reports").set(as(bob))).statusCode).toBe(403);
    const list = await request(app).get("/api/admin/reports").set(as(admin));
    expect(list.body.length).toBe(1);
  });

  it("blocks non-admins from every admin route", async () => {
    expect((await request(app).get("/api/admin/users").set(as(alice))).statusCode).toBe(403);
    expect((await request(app).put(`/api/admin/users/${bob.id}/suspend`).set(as(alice))).statusCode).toBe(403);
    expect((await request(app).put(`/api/admin/users/${alice.id}`).set(as(alice)).send({ role: "admin" })).statusCode).toBe(403);
  });

  it("stops an admin from suspending or demoting themselves", async () => {
    expect((await request(app).put(`/api/admin/users/${admin.id}/suspend`).set(as(admin))).statusCode).toBe(400);
    expect((await request(app).put(`/api/admin/users/${admin.id}`).set(as(admin)).send({ role: "user" })).statusCode).toBe(400);
  });

  it("cuts off a suspended user's existing token straight away", async () => {
    expect((await request(app).get("/api/auth/me").set(as(bob))).statusCode).toBe(200);
    await request(app).put(`/api/admin/users/${bob.id}/suspend`).set(as(admin));
    expect((await request(app).get("/api/auth/me").set(as(bob))).statusCode).toBe(403);
    expect((await request(app).post("/api/auth/login").send({ email: bob.email, password: "Test1234!" })).statusCode).toBe(403);
    await request(app).put(`/api/admin/users/${bob.id}/unsuspend`).set(as(admin));
    expect((await request(app).get("/api/auth/me").set(as(bob))).statusCode).toBe(200);
  });

  it("hides suspended users from search", async () => {
    await request(app).put(`/api/admin/users/${bob.id}/suspend`).set(as(admin));
    const search = await request(app).get("/api/matches/search?q=Sec%20bob").set(as(alice));
    expect(search.body.some((u) => u._id === bob.id)).toBe(false);
  });
});

describe("Conversations", () => {
  it("lists each conversation once with the partner's public details and unread count", async () => {
    // The conversation list uses a MongoDB aggregation. FerretDB (a
    // MongoDB-compatible server sometimes used locally) does not support it.
    const info = await mongoose.connection.db.admin().buildInfo();
    if (info.ferretdbVersion) return;

    await request(app).put(`/api/admin/users/${bob.id}/unsuspend`).set(as(admin));
    await request(app).post(`/api/messages/${alice.id}`).set(as(bob)).send({ text: "Reply 1" });
    await request(app).post(`/api/messages/${alice.id}`).set(as(bob)).send({ text: "Reply 2" });

    const res = await request(app).get("/api/messages/conversations").set(as(alice));
    expect(res.statusCode).toBe(200);
    const withBob = res.body.filter((c) => c._id === bob.id);
    expect(withBob.length).toBe(1);
    expect(withBob[0].lastMessage.text).toBe("Reply 2");
    expect(withBob[0].unreadCount).toBe(2);
    expect(withBob[0].otherUser.name).toBe("Sec bob");
    expect(JSON.stringify(res.body)).not.toContain("@example.com");
  });
});
