// backend/controllers/authController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");
const { fail } = require("../utils/http");

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Map frontend level labels to CEFR codes
const LEVEL_MAP = {
  Beginner: "A1",
  Elementary: "A2",
  Intermediate: "B1",
  "Upper-Intermediate": "B2",
  Advanced: "C1",
  Native: "C2",
};

// Best-effort timezone from country name (covers common cases)
const COUNTRY_TIMEZONE_MAP = {
  thailand: "Asia/Bangkok",
  japan: "Asia/Tokyo",
  "south korea": "Asia/Seoul",
  korea: "Asia/Seoul",
  china: "Asia/Shanghai",
  vietnam: "Asia/Ho_Chi_Minh",
  indonesia: "Asia/Jakarta",
  malaysia: "Asia/Kuala_Lumpur",
  singapore: "Asia/Singapore",
  philippines: "Asia/Manila",
  india: "Asia/Kolkata",
  australia: "Australia/Sydney",
  "united kingdom": "Europe/London",
  uk: "Europe/London",
  france: "Europe/Paris",
  germany: "Europe/Berlin",
  "united states": "America/New_York",
  usa: "America/New_York",
  us: "America/New_York",
  canada: "America/Toronto",
  brazil: "America/Sao_Paulo",
};

function guessTimezone(country) {
  if (!country) return "UTC";
  return COUNTRY_TIMEZONE_MAP[String(country).trim().toLowerCase()] || "UTC";
}

// POST /api/auth/register: creates the User and its Profile together.
// If the profile cannot be created, the user is removed again so no
// half-registered account is left behind.
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, confirmPassword,
      dateOfBirth, gender, country, city, timezone,
      nativeLanguage, learningLanguages = [], interests = [], bio,
    } = req.body || {};

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (typeof email !== "string" || !EMAIL_RE.test(email) || email.length > 255) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!country || !city) {
      return res.status(400).json({ message: "Country and city are required" });
    }
    if (!nativeLanguage) {
      return res.status(400).json({ message: "Native language is required" });
    }

    const normalisedEmail = email.toLowerCase().trim();
    if (await User.findOne({ email: normalisedEmail })) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const languagesLearning = (Array.isArray(learningLanguages) ? learningLanguages : [])
      .filter((l) => l && l.language && l.level)
      .map((l) => ({ language: l.language, level: LEVEL_MAP[l.level] || l.level }));

    const passwordHash = await bcrypt.hash(password, 10);
    // The role is always "user" here. Admins are promoted by another admin.
    const user = await User.create({ name, email: normalisedEmail, passwordHash, role: "user" });

    let profile;
    try {
      profile = await Profile.create({
        user: user._id,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        country,
        city,
        timezone: timezone || guessTimezone(country),
        nativeLanguage,
        languagesLearning,
        interests: Array.isArray(interests) ? interests : [],
        bio: bio || undefined,
      });
    } catch (profileError) {
      await User.deleteOne({ _id: user._id });
      throw profileError;
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      profile,
    });
  } catch (error) {
    return fail(res, error);
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // Same message for an unknown email and a wrong password.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return fail(res, error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    return fail(res, error);
  }
};

// PUT /api/auth/me: change own display name
exports.updateMe = async (req, res) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) return res.status(400).json({ message: "Name is required" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name } },
      { returnDocument: "after", runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    const { passwordHash, ...safe } = user.toObject();
    return res.json(safe);
  } catch (error) {
    return fail(res, error);
  }
};
