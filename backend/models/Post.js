// backend/models/Post.js
// Design Pattern: MODEL (MVC Pattern)
// Reason: Post is the Model in MVC — it defines the data schema and structure,
//         separated from business logic (Controller) and presentation (Frontend).
//         This separation improves maintainability and testability.

const mongoose = require("mongoose");

// Embedded schema for comments (sub-document pattern)
const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    voiceNoteUrl: {
      type: String,
      trim: true,
    },
    learningLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    nativeLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    // Topics selected when creating a post (e.g. Exercise, Movie, Podcast)
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      country: String,
      city: String,
    },
    // Like count and list of users who liked this post
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Embedded comments using sub-document schema
    comments: [commentSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);