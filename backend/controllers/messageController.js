// controllers/messageController.js
const Message = require("../models/Message");
const User    = require("../models/User");

// GET /api/messages/conversations  — list all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const myId = req.user.id;

    // Get latest message per conversation partner
    const messages = await Message.aggregate([
      { $match: {
        $or: [{ sender: myId }, { receiver: myId }],
        isDeleted: { $ne: true },
      }},
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: {
          $cond: [{ $eq: ["$sender", { $toObjectId: myId }] }, "$receiver", "$sender"]
        },
        lastMessage: { $first: "$$ROOT" },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [
                { $eq: ["$receiver", { $toObjectId: myId }] },
                { $eq: ["$read", false] }
              ]},
              1, 0
            ]
          }
        }
      }},
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    // Populate other user info
    const populated = await Promise.all(
      messages.map(async (conv) => {
        const otherUser = await User.findById(conv._id).select("name email");
        return {
          _id: conv._id,
          otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          isOnline: false, // can extend with socket.io later
        };
      })
    );

    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/messages/:userId  — get messages between me and userId
exports.getMessages = async (req, res) => {
  try {
    const myId     = req.user.id;
    const otherId  = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId,    receiver: otherId },
        { sender: otherId, receiver: myId    },
      ],
      isDeleted: { $ne: true },
    }).sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { sender: otherId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// POST /api/messages/:userId  — send message to userId
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

// DELETE /api/messages/:messageId  — soft delete a message
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