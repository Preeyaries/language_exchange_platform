const mongoose = require("mongoose");
 
const messageSchema = new mongoose.Schema(
  {
    sender:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:         { type: String, trim: true, default: "" },
    imageUrl:     { type: String, trim: true, default: "" },
    voiceNoteUrl: { type: String, trim: true, default: "" },
    read:      { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Message", messageSchema);