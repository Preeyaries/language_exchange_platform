const mongoose = require("mongoose");
const Message  = require("../models/Message");
const User     = require("../models/User");
const Profile  = require("../models/Profile");
const { fail, isHttpUrl } = require("../utils/http");
const { publicUser } = require("../utils/publicUser");

// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user.id);

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: myId }, { receiver: myId }], isDeleted: { $ne: true } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ["$sender", myId] }, "$receiver", "$sender"] },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ["$receiver", myId] }, { $eq: ["$read", false] }] }, 1, 0] },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    // Two queries for all conversation partners instead of two per conversation
    const ids = conversations.map((c) => c._id);
    const [users, profiles] = await Promise.all([
      User.find({ _id: { $in: ids } }).select("name email"),
      Profile.find({ user: { $in: ids } }).select("user gender profilePicture"),
    ]);
    const userById = new Map(users.map((u) => [String(u._id), u]));
    const profileByUser = new Map(profiles.map((p) => [String(p.user), p]));

    return res.json(
      conversations.map((conv) => ({
        _id: conv._id,
        otherUser: publicUser(userById.get(String(conv._id)), profileByUser.get(String(conv._id)) || null),
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount,
        isOnline: false,
      }))
    );
  } catch (error) {
    return fail(res, error);
  }
};

// GET /api/messages/:userId
exports.getMessages = async (req, res) => {
  try {
    const myId    = req.user.id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [{ sender: myId, receiver: otherId }, { sender: otherId, receiver: myId }],
      isDeleted: { $ne: true },
    }).sort({ createdAt: 1 });

    await Message.updateMany({ sender: otherId, receiver: myId, read: false }, { $set: { read: true } });

    return res.json(messages);
  } catch (error) {
    return fail(res, error);
  }
};

// POST /api/messages/:userId
exports.sendMessage = async (req, res) => {
  try {
    const myId    = req.user.id;
    const otherId = req.params.userId;
    const text         = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    const voiceNoteUrl = req.body?.voiceNoteUrl || "";
    const imageUrl     = req.body?.imageUrl || "";

    if (!text && !voiceNoteUrl && !imageUrl) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    if (!isHttpUrl(voiceNoteUrl) || !isHttpUrl(imageUrl)) {
      return res.status(400).json({ message: "Media links must be http(s) URLs" });
    }
    if (otherId === myId) {
      return res.status(400).json({ message: "You cannot message yourself" });
    }
    if (!(await User.exists({ _id: otherId }))) {
      return res.status(404).json({ message: "User not found" });
    }

    const message = await Message.create({
      sender: myId, receiver: otherId, text, voiceNoteUrl, imageUrl, read: false,
    });
    return res.status(201).json(message);
  } catch (error) {
    return fail(res, error);
  }
};

// DELETE /api/messages/:messageId (sender only)
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.messageId, sender: req.user.id },
      { $set: { isDeleted: true } },
      { returnDocument: "after" }
    );
    if (!message) return res.status(404).json({ message: "Message not found or not yours" });
    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    return fail(res, error);
  }
};
