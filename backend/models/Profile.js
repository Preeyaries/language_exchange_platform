const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    ageRange: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    timezone: {
      type: String,
      required: true,
      trim: true,
    },
    nativeLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    languagesLearning: [
      {
        language: {
          type: String,
          required: true,
          trim: true,
        },
        level: {
          type: String,
          enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
          required: true,
        },
      },
    ],
    learningGoals: [
      {
        type: String,
        enum: ["speaking", "grammar", "travel", "business", "exam preparation"],
      },
    ],
    preferredCommunicationMethods: [
      {
        type: String,
        enum: ["chat", "voice", "video"],
      },
    ],
    availability: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    interests: [String],
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    profilePicture: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);