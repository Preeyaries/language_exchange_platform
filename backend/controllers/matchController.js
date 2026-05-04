// backend/controllers/matchController.js
// Design Pattern: CONTROLLER (MVC Pattern)
// Reason: Handles business logic for user search and language partner matching,
//         separated from routing and data model concerns.

const User    = require("../models/User");
const Profile = require("../models/Profile");

// GET /api/matches — Find language partners
// Matches users whose native language = current user's learning language
// and whose learning language = current user's native language
exports.getMatches = async (req, res) => {
  try {
    const myProfile = await Profile.findOne({ user: req.user.id });
    if (!myProfile) {
      return res.status(404).json({ message: "Create your profile first" });
    }

    const myNative    = myProfile.nativeLanguage;
    const myLearning  = myProfile.languagesLearning?.map(l => l.language) || [];

    const matches = await Profile.find({
      user: { $ne: req.user.id },
      nativeLanguage: { $in: myLearning },
      "languagesLearning.language": myNative,
    })
      .populate("user", "name email")
      .limit(20);

    const result = matches.map(p => ({
      _id: p.user._id,
      name: p.user.name,
      email: p.user.email,
      gender: p.gender || "",
      nativeLanguage: p.nativeLanguage,
      languagesLearning: p.languagesLearning,
      bio: p.bio,
      city: p.city,
      country: p.country,
      interests: p.interests,
      profilePicture: p.profilePicture,
    }));

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/matches/search?q=name — Search users by name or language
// Design Pattern: FACADE Pattern
// Reason: Hides the complexity of querying both User and Profile collections
//         and joining the results behind a simple search endpoint.
exports.searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    // Search users by name (case-insensitive)
    const users = await User.find({
      _id: { $ne: req.user.id },
      name: { $regex: q, $options: "i" },
    }).select("name email").limit(15);

    // Also search by language in profiles
    const profilesByLang = await Profile.find({
      user: { $ne: req.user.id },
      $or: [
        { nativeLanguage: { $regex: q, $options: "i" } },
        { "languagesLearning.language": { $regex: q, $options: "i" } },
      ],
    }).populate("user", "name email").limit(15);

    // Merge and deduplicate results
    const seen = new Set();
    const result = [];

    for (const u of users) {
      if (!seen.has(String(u._id))) {
        seen.add(String(u._id));
        const profile = await Profile.findOne({ user: u._id });
        result.push({
          _id: u._id,
          name: u.name,
          email: u.email,
          gender: profile?.gender || "",
          nativeLanguage: profile?.nativeLanguage || "",
          languagesLearning: profile?.languagesLearning || [],
          bio: profile?.bio || "",
          city: profile?.city || "",
          country: profile?.country || "",
          profilePicture: profile?.profilePicture || null,
        });
      }
    }

    for (const p of profilesByLang) {
      if (p.user && !seen.has(String(p.user._id))) {
        seen.add(String(p.user._id));
        result.push({
          _id: p.user._id,
          name: p.user.name,
          email: p.user.email,
          gender: p.gender || "",
          nativeLanguage: p.nativeLanguage,
          languagesLearning: p.languagesLearning,
          bio: p.bio,
          city: p.city,
          country: p.country,
          profilePicture: p.profilePicture,
        });
      }
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};