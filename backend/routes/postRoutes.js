const express = require("express");
const auth = require("../middleware/auth");
const {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updateMyPost,
  deleteMyPost,
  getPostsByUser,
} = require("../controllers/postController");

const router = express.Router();

router.get("/", getAllPosts);
router.get("/my-posts", auth, getMyPosts);
router.get("/user/:userId", getPostsByUser);
router.get("/:id", getPostById);
router.post("/", auth, createPost);
router.put("/:id", auth, updateMyPost);
router.delete("/:id", auth, deleteMyPost);

module.exports = router;