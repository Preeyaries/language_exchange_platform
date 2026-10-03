// backend/controllers/postController.js
// Design Pattern: CONTROLLER (MVC Pattern)
// Reason: This file handles all business logic for posts, sitting between
//         the Model (Post.js) and the View (Frontend React components).
//         Each exported function maps to a specific route, keeping concerns separated.

const Post = require("../models/Post");
const Profile = require("../models/Profile");
const { fail, pick, isHttpUrl } = require("../utils/http");
const { publicUser } = require("../utils/publicUser");

// Fields an author may set. Everything else (author, likes, likedBy,
// comments, isDeleted) is controlled by the server.
const POST_FIELDS = ["text", "imageUrl", "voiceNoteUrl", "learningLanguage", "nativeLanguage", "topics"];

function cleanPostInput(body) {
  const data = pick(body, POST_FIELDS);
  if (!isHttpUrl(data.imageUrl) || !isHttpUrl(data.voiceNoteUrl)) {
    const err = new Error("Media links must be http(s) URLs");
    err.statusCode = 400;
    throw err;
  }
  if (data.topics !== undefined) {
    data.topics = (Array.isArray(data.topics) ? data.topics : []).map(String).slice(0, 10);
  }
  return data;
}

// Turn populated posts into what the client may see: authors and commenters
// become { _id, name, handle, gender } and email addresses are dropped.
// Genders are fetched in one query for the whole list.
async function present(posts) {
  const list = posts.map((p) => (typeof p.toObject === "function" ? p.toObject() : p));
  const authorIds = [...new Set(list.map((p) => String(p.author?._id || p.author)).filter(Boolean))];
  const profiles = await Profile.find({ user: { $in: authorIds } }).select("user gender profilePicture");
  const byUser = new Map(profiles.map((pr) => [String(pr.user), pr]));

  return list.map((p) => {
    // Only populated authors are reshaped. An unpopulated author stays an id.
    if (p.author && p.author.name !== undefined) {
      p.author = publicUser(p.author, byUser.get(String(p.author._id)) || null);
    }
    p.comments = (p.comments || []).map((c) => ({
      ...c,
      author: c.author && c.author.name !== undefined ? publicUser(c.author) : c.author,
    }));
    return p;
  });
}

const POPULATE = [
  { path: "author", select: "name email" },
  { path: "comments.author", select: "name email" },
];

// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(400).json({ message: "Create profile first" });

    const input = cleanPostInput(req.body);
    const post = await Post.create({
      author: req.user.id,
      text: input.text,
      imageUrl: input.imageUrl || "",
      voiceNoteUrl: input.voiceNoteUrl || "",
      learningLanguage: input.learningLanguage || profile.languagesLearning?.[0]?.language || "",
      nativeLanguage: input.nativeLanguage || profile.nativeLanguage || "",
      topics: input.topics || [],
      location: { country: profile.country, city: profile.city },
    });

    return res.status(201).json(post);
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ message: error.message });
    return fail(res, error);
  }
};

// GET /api/posts: the feed
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: false }).populate(POPULATE).sort({ createdAt: -1 }).limit(200);
    return res.json(await present(posts));
  } catch (error) {
    return fail(res, error);
  }
};

// GET /api/posts/my-posts
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id, isDeleted: false })
      .populate(POPULATE[1]).sort({ createdAt: -1 });
    return res.json(await present(posts));
  } catch (error) {
    return fail(res, error);
  }
};

// GET /api/posts/user/:userId
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId, isDeleted: false })
      .populate(POPULATE[1]).sort({ createdAt: -1 });
    return res.json(await present(posts));
  } catch (error) {
    return fail(res, error);
  }
};

// GET /api/posts/:id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false }).populate(POPULATE);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json((await present([post]))[0]);
  } catch (error) {
    return fail(res, error);
  }
};

// PUT /api/posts/:id (author only)
exports.updateMyPost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id, isDeleted: false },
      { $set: cleanPostInput(req.body) },
      { returnDocument: "after", runValidators: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found or not yours" });
    return res.json(post);
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ message: error.message });
    return fail(res, error);
  }
};

// DELETE /api/posts/:id: soft delete (author only)
exports.deleteMyPost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id, isDeleted: false },
      { $set: { isDeleted: true } },
      { returnDocument: "after" }
    );
    if (!post) return res.status(404).json({ message: "Post not found or not yours" });
    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    return fail(res, error);
  }
};

// POST /api/posts/:id/comments
// Design Pattern: FACADE Pattern
// Reason: Hides the complexity of pushing to an embedded sub-document array
//         and populating references behind a simple interface.
exports.addComment = async (req, res) => {
  try {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $push: { comments: { author: req.user.id, text } } },
      { returnDocument: "after", runValidators: true }
    ).populate(POPULATE[1]);
    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json((await present([post]))[0]);
  } catch (error) {
    return fail(res, error);
  }
};

// DELETE /api/posts/:id/comments/:commentId (comment author only)
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $pull: { comments: { _id: req.params.commentId, author: req.user.id } } },
      { returnDocument: "after" }
    ).populate(POPULATE[1]);
    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json((await present([post]))[0]);
  } catch (error) {
    return fail(res, error);
  }
};

// POST /api/posts/:id/like: toggle like
// Design Pattern: FACADE Pattern
// Reason: One endpoint hides the like / unlike decision. Each branch is a
//         single atomic update, so two quick taps (or two devices) cannot
//         count the same user twice.
exports.toggleLike = async (req, res) => {
  try {
    const filter = { _id: req.params.id, isDeleted: false };

    let post = await Post.findOneAndUpdate(
      { ...filter, likedBy: req.user.id },
      { $pull: { likedBy: req.user.id }, $inc: { likes: -1 } },
      { returnDocument: "after" }
    );
    if (post) return res.json({ likes: Math.max(0, post.likes), liked: false });

    post = await Post.findOneAndUpdate(
      { ...filter, likedBy: { $ne: req.user.id } },
      { $addToSet: { likedBy: req.user.id }, $inc: { likes: 1 } },
      { returnDocument: "after" }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json({ likes: post.likes, liked: true });
  } catch (error) {
    return fail(res, error);
  }
};
