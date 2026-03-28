// controllers/postController.js
const Post = require("../models/Post");
const Profile = require("../models/Profile");

exports.createPost = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(400).json({ message: "Create profile first" });
    }

    const post = await Post.create({
      author: req.user.id,
      text: req.body.text,
      imageUrl: req.body.imageUrl || "",
      voiceNoteUrl: req.body.voiceNoteUrl || "",
      learningLanguage: req.body.learningLanguage || profile.languagesLearning?.[0]?.language || "",
      nativeLanguage: req.body.nativeLanguage || profile.nativeLanguage || "",
      topics: req.body.topics || [],   // ← เพิ่ม
      location: {
        country: profile.country,
        city: profile.city,
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: false })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.user.id,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /posts/user/:userId  — posts by any user (used in Profile page My Post tab)
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.params.userId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateMyPost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id, isDeleted: false },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found or not yours" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteMyPost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found or not yours" });
    }

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};