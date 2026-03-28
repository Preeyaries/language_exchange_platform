// controllers/followController.js
const User = require("../models/User");

// POST /api/follow/:id  — follow a user
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user.id;

    if (targetId === myId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add targetId to my following list (if not already)
    await User.findByIdAndUpdate(myId, {
      $addToSet: { following: targetId },
    });

    // Add myId to target's followers list
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: myId },
    });

    return res.json({ message: "Followed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/follow/:id  — unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user.id;

    await User.findByIdAndUpdate(myId, {
      $pull: { following: targetId },
    });

    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: myId },
    });

    return res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/follow/status/:id  — check if I follow this user
exports.followStatus = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user.id;

    const me = await User.findById(myId).select("following");
    const isFollowing = me?.following?.map(String).includes(String(targetId)) || false;

    return res.json({ isFollowing });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};