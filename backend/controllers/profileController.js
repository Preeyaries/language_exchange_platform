const Profile = require("../models/Profile");
const { fail, pick, isHttpUrl } = require("../utils/http");
const { handleOf, ageRangeOf } = require("../utils/publicUser");

// The only profile fields a user may write. `user` is never taken from the body.
const PROFILE_FIELDS = [
  "dateOfBirth", "gender", "country", "city", "timezone", "nativeLanguage",
  "languagesLearning", "learningGoals", "preferredCommunicationMethods",
  "availability", "interests", "bio", "profilePicture",
];

function cleanProfileInput(body) {
  const data = pick(body, PROFILE_FIELDS);
  if (data.profilePicture !== undefined && !isHttpUrl(data.profilePicture)) {
    const err = new Error("Profile picture must be an http(s) link");
    err.statusCode = 400;
    throw err;
  }
  return data;
}

// POST /api/profile
exports.createProfile = async (req, res) => {
  try {
    if (await Profile.findOne({ user: req.user.id })) {
      return res.status(400).json({ message: "Profile already exists" });
    }
    const profile = await Profile.create({ ...cleanProfileInput(req.body), user: req.user.id });
    return res.status(201).json(profile);
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ message: error.message });
    return fail(res, error);
  }
};

// GET /api/profile: own profile, including private fields
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user", "name email role followers following"
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    return res.json({
      ...profile.toObject(),
      ageRange: ageRangeOf(profile.dateOfBirth),
      followersCount: profile.user?.followers?.length || 0,
      followingCount: profile.user?.following?.length || 0,
    });
  } catch (error) {
    return fail(res, error);
  }
};

// GET /api/profile/:id: another user's profile.
// Email, date of birth and the follower lists stay private. Administrators
// see the email because the admin edit screen needs it.
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate(
      "user", "name email role followers following"
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const owner = profile.user;
    const isSelfOrAdmin = req.user.role === "admin" || String(owner?._id) === req.user.id;
    const data = profile.toObject();
    const dateOfBirth = data.dateOfBirth;

    data.user = {
      _id: owner?._id,
      name: owner?.name,
      handle: handleOf(owner?.email),
      ...(isSelfOrAdmin && { email: owner?.email, role: owner?.role }),
    };
    if (!isSelfOrAdmin) delete data.dateOfBirth;

    return res.json({
      ...data,
      ageRange: ageRangeOf(dateOfBirth),
      isFollowing: owner?.followers?.map(String).includes(req.user.id) || false,
      followersCount: owner?.followers?.length || 0,
      followingCount: owner?.following?.length || 0,
    });
  } catch (error) {
    return fail(res, error);
  }
};

// PUT /api/profile: update own profile
exports.updateMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: cleanProfileInput(req.body) },
      { returnDocument: "after", runValidators: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.json({ ...profile.toObject(), ageRange: ageRangeOf(profile.dateOfBirth) });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ message: error.message });
    return fail(res, error);
  }
};

exports.PROFILE_FIELDS = PROFILE_FIELDS;
exports.cleanProfileInput = cleanProfileInput;
