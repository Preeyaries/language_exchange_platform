const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");

// Map frontend level labels → CEFR codes
const LEVEL_MAP = {
  Beginner: "A1",
  Elementary: "A2",
  Intermediate: "B1",
  "Upper-Intermediate": "B2",
  Advanced: "C1",
  Native: "C2",
};

// Derive ageRange string from dateOfBirth
function getAgeRange(dateOfBirth) {
  if (!dateOfBirth) return null;
  const age = Math.floor(
    (Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)
  );
  if (age < 18) return "Under 18";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  if (age <= 54) return "45-54";
  return "55+";
}

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
  const key = country.trim().toLowerCase();
  return COUNTRY_TIMEZONE_MAP[key] || "UTC";
}

// ─────────────────────────────────────────────
// REGISTER — creates User + Profile atomically
// ─────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      // Step 1 — Account
      name,
      email,
      password,
      confirmPassword,
      // Step 2 — Personal
      dateOfBirth,
      gender,
      country,
      city,
      timezone,
      // Step 3 — Language & Interests
      nativeLanguage,
      learningLanguages = [],  // [{ language, level }]
      interests = [],
      bio,
    } = req.body;

    // ── Validation ──────────────────────────────
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
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

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ── Create User ──────────────────────────────
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "user",
    });

    // ── Build languagesLearning with CEFR levels ─
    const languagesLearning = learningLanguages
      .filter((l) => l.language && l.level)
      .map((l) => ({
        language: l.language,
        level: LEVEL_MAP[l.level] || l.level, // accept CEFR directly too
      }));

    // ── Create Profile ───────────────────────────
    const profile = await Profile.create({
      user: user._id,
      ageRange: getAgeRange(dateOfBirth),
      gender: gender || undefined,
      country,
      city,
      timezone: timezone || guessTimezone(country),
      nativeLanguage,
      languagesLearning,
      interests,
      bio: bio || undefined,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isSuspended) {
      return res
        .status(403)
        .json({ message: "Your account has been suspended" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};