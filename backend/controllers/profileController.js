const Profile = require("../models/Profile");
const User = require("../models/User");

exports.createProfile = async (req, res) => {
  try {
    const existing = await Profile.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Profile already exists" });
    }
    const profile = await Profile.create({
      ...req.body,
      user: req.user.id,
    });
    return res.status(201).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/profile  — own profile + follower counts
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user", "name email role followers following"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({
      ...profile.toObject(),
      followersCount: profile.user?.followers?.length || 0,
      followingCount: profile.user?.following?.length || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/profile/:id  — other user's profile + isFollowing flag
exports.getProfileById = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const profile = await Profile.findOne({ user: targetUserId }).populate(
      "user", "name email role followers following"
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Check if the requesting user follows this profile
    const isFollowing = profile.user?.followers
      ?.map(String)
      .includes(String(req.user.id)) || false;

    return res.json({
      ...profile.toObject(),
      isFollowing,
      followersCount: profile.user?.followers?.length || 0,
      followingCount: profile.user?.following?.length || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/profile  — update own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};