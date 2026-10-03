// backend/controllers/followController.js
const User = require("../models/User");
const { fail } = require("../utils/http");

// POST /api/follow/:id
exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user.id;

    if (targetId === myId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    if (!(await User.exists({ _id: targetId }))) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.updateOne({ _id: myId }, { $addToSet: { following: targetId } });
    await User.updateOne({ _id: targetId }, { $addToSet: { followers: myId } });

    return res.json({ message: "Followed successfully" });
  } catch (error) {
    return fail(res, error);
  }
};

// DELETE /api/follow/:id
exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user.id;

    await User.updateOne({ _id: myId }, { $pull: { following: targetId } });
    await User.updateOne({ _id: targetId }, { $pull: { followers: myId } });

    return res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    return fail(res, error);
  }
};

// GET /api/follow/status/:id
exports.followStatus = async (req, res) => {
  try {
    const isFollowing = Boolean(await User.exists({ _id: req.user.id, following: req.params.id }));
    return res.json({ isFollowing });
  } catch (error) {
    return fail(res, error);
  }
};
