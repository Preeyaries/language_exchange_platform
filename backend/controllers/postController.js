// backend/controllers/postController.js
// Design Pattern: CONTROLLER (MVC Pattern)
// Reason: This file handles all business logic for posts — sitting between
//         the Model (Post.js) and the View (Frontend React components).
//         Each exported function maps to a specific route, keeping concerns separated.

const Post = require("../models/Post");
const Profile = require("../models/Profile");

// POST /api/posts — Create a new post
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
      topics: req.body.topics || [],
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

// GET /api/posts — Get all posts (feed)
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: false })
      .populate("author", "name email")
      .populate("comments.author", "name email")
      .sort({ createdAt: -1 });

    const postsWithGender = await Promise.all(posts.map(async (post) => {
      const p = post.toObject();
      if (p.author?._id) {
        const profile = await Profile.findOne({ user: p.author._id }).select("gender");
        p.author.gender = profile?.gender || "";
      }
      return p;
    }));

    return res.json(postsWithGender);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/my-posts — Get current user's posts
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.user.id,
      isDeleted: false,
    })
      .populate("comments.author", "name email")
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/user/:userId — Get posts by a specific user
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({
      author: req.params.userId,
      isDeleted: false,
    })
      .populate("comments.author", "name email")
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/posts/:id — Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("author", "name email")
      .populate("comments.author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/posts/:id — Update a post (author only)
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

// DELETE /api/posts/:id — Soft delete a post (author only)
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

// POST /api/posts/:id/comments — Add a comment to a post
// Design Pattern: FACADE Pattern
// Reason: This function hides the complexity of pushing to an embedded
//         sub-document array and populating references behind a simple interface.
exports.addComment = async (req, res) => {
  try {
    if (!req.body.text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        $push: {
          comments: {
            author: req.user.id,
            text: req.body.text.trim(),
          },
        },
      },
      { new: true }
    ).populate("comments.author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:id/comments/:commentId — Delete a comment (author only)
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      {
        $pull: {
          comments: {
            _id: req.params.commentId,
            author: req.user.id,
          },
        },
      },
      { new: true }
    ).populate("comments.author", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/posts/:id/like — Toggle like on a post
// Design Pattern: FACADE Pattern
// Reason: Hides the complexity of checking if the user already liked the post,
//         then either adding or removing the like — behind a single toggle endpoint.
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likedBy.map(String).includes(String(req.user.id));

    if (alreadyLiked) {
      // Unlike
      post.likedBy.pull(req.user.id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.likedBy.push(req.user.id);
      post.likes += 1;
    }

    await post.save();
    return res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};