const Message  = require("../models/Message");
const User     = require("../models/User");
const Profile = require("../models/Profile");
const mongoose = require("mongoose");


// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user.id);

    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: myId }, { receiver: myId }],
          isDeleted: { $ne: true },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", myId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", myId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    const populated = await Promise.all(
      messages.map(async (conv) => {
        const otherUser = await User.findById(conv._id).select("name email");
        const profile = await Profile.findOne({ user: conv._id }).select("gender profilePicture");
        return {
          _id: conv._id,
          otherUser: {
            ...otherUser?.toObject(),
            gender: profile?.gender || "",
            profilePicture: profile?.profilePicture || null,
          },
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          isOnline: false,
        };
      })
    );

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/messages/:userId
exports.getMessages = async (req, res) => {
  try {
    const myId    = req.user.id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId,    receiver: otherId },
        { sender: otherId, receiver: myId    },
      ],
      isDeleted: { $ne: true },
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: otherId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/messages/:userId
exports.sendMessage = async (req, res) => {
  try {
    const myId    = req.user.id;
    const otherId = req.params.userId;
    const { text, voiceNoteUrl, imageUrl } = req.body;

    if (!text && !voiceNoteUrl && !imageUrl) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const message = await Message.create({
      sender:       myId,
      receiver:     otherId,
      text:         text || "",
      voiceNoteUrl: voiceNoteUrl || "",
      imageUrl:     imageUrl || "",
      read:         false,
    });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/messages/:messageId
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.messageId, sender: req.user.id },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found or not yours" });
    }

    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};