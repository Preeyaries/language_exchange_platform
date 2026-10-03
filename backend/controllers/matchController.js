// backend/controllers/matchController.js
// Design Pattern: CONTROLLER (MVC Pattern)
// Reason: Handles business logic for user search and language partner matching,
//         separated from routing and data model concerns.

const User    = require("../models/User");
const Profile = require("../models/Profile");
const { fail, escapeRegex } = require("../utils/http");
const { handleOf } = require("../utils/publicUser");

// The card shown for a possible partner. No email address.
function partnerCard(user, profile) {
  return {
    _id: user._id,
    name: user.name,
    handle: handleOf(user.email),
    gender: profile?.gender || "",
    nativeLanguage: profile?.nativeLanguage || "",
    languagesLearning: profile?.languagesLearning || [],
    bio: profile?.bio || "",
    city: profile?.city || "",
    country: profile?.country || "",
    interests: profile?.interests || [],
    profilePicture: profile?.profilePicture || null,
  };
}

// GET /api/matches: find language partners.
// A match speaks a language I am learning and is learning my native language.
exports.getMatches = async (req, res) => {
  try {
    const myProfile = await Profile.findOne({ user: req.user.id });
    if (!myProfile) return res.status(404).json({ message: "Create your profile first" });

    const myLearning = myProfile.languagesLearning?.map((l) => l.language) || [];

    const matches = await Profile.find({
      user: { $ne: req.user.id },
      nativeLanguage: { $in: myLearning },
      "languagesLearning.language": myProfile.nativeLanguage,
    })
      .populate("user", "name email isSuspended")
      .limit(20);

    return res.json(
      matches.filter((p) => p.user && !p.user.isSuspended).map((p) => partnerCard(p.user, p))
    );
  } catch (error) {
    return fail(res, error);
  }
};

// GET /api/matches/search?q=...: search users by name or language
// Design Pattern: FACADE Pattern
// Reason: Hides the complexity of querying both User and Profile collections
//         and joining the results behind a simple search endpoint.
exports.searchUsers = async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 60) : "";
    if (!q) return res.json([]);

    // The search text is escaped so it is matched literally, not run as a pattern.
    const pattern = { $regex: escapeRegex(q), $options: "i" };

    const users = await User.find({ _id: { $ne: req.user.id }, isSuspended: { $ne: true }, name: pattern })
      .select("name email").limit(15);

    const profilesByLang = await Profile.find({
      user: { $ne: req.user.id },
      $or: [{ nativeLanguage: pattern }, { "languagesLearning.language": pattern }],
    }).populate("user", "name email isSuspended").limit(15);

    // One query for the profiles of everyone found by name
    const nameProfiles = await Profile.find({ user: { $in: users.map((u) => u._id) } });
    const profileByUser = new Map(nameProfiles.map((p) => [String(p.user), p]));

    const seen = new Set();
    const result = [];
    for (const u of users) {
      seen.add(String(u._id));
      result.push(partnerCard(u, profileByUser.get(String(u._id))));
    }
    for (const p of profilesByLang) {
      if (p.user && !p.user.isSuspended && !seen.has(String(p.user._id))) {
        seen.add(String(p.user._id));
        result.push(partnerCard(p.user, p));
      }
    }

    return res.json(result);
  } catch (error) {
    return fail(res, error);
  }
};
