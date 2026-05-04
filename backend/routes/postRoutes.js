// backend/routes/postRoutes.js
// Design Pattern: MIDDLEWARE Pattern
// Reason: Each route uses the `auth` middleware to protect endpoints —
//         this is a chain of responsibility where the request passes through
//         authentication before reaching the controller function.
//         Routes also act as the entry point of the MVC pattern, directing
//         requests to the appropriate Controller.

const express = require("express");
const auth = require("../middleware/auth");
const {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostsByUser,
  getPostById,
  updateMyPost,
  deleteMyPost,
  addComment,
  deleteComment,
  toggleLike,
} = require("../controllers/postController");

const router = express.Router();

// Post CRUD routes
// NOTE: Specific routes (my-posts, user/:userId) must come before /:id
//       to prevent them being matched as an ID parameter
router.get("/", getAllPosts);
router.get("/my-posts",        auth, getMyPosts);
router.get("/user/:userId",    auth, getPostsByUser);
router.get("/:id",                  getPostById);
router.post("/",               auth, createPost);
router.put("/:id",             auth, updateMyPost);
router.delete("/:id",          auth, deleteMyPost);

// Comment routes
router.post("/:id/comments",               auth, addComment);
router.delete("/:id/comments/:commentId",  auth, deleteComment);

// Like route
router.post("/:id/like", auth, toggleLike);

module.exports = router;