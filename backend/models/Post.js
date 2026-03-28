const mongoose = require("mongoose");

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
    // Topics selected when creating post (e.g. Exercise, Movie, Podcast)
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);