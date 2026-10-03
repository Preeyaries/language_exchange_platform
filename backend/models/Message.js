const mongoose = require("mongoose");
 
const messageSchema = new mongoose.Schema(
  {
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:         { type: String, trim: true, default: "", maxlength: 2000 },
    imageUrl:     { type: String, trim: true, default: "" },
    voiceNoteUrl: { type: String, trim: true, default: "" },
    read:      { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
 
// Serves both "conversation between two users" and "my conversations".
messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model("Message", messageSchema);