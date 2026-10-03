const User = require("../models/User");
const Post = require("../models/Post");
const Profile = require("../models/Profile");
const Report = require("../models/Report");
const { fail, pick } = require("../utils/http");
const { cleanProfileInput } = require("./profileController");

// A user document without its password hash.
function safeUser(user) {
  const out = user.toObject();
  delete out.passwordHash;
  return out;
}

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return fail(res, error);
  }
};

async function setSuspended(req, res, isSuspended) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You cannot suspend your own account" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { isSuspended } }, { returnDocument: "after" });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(safeUser(user));
  } catch (error) {
    return fail(res, error);
  }
}

// PUT /api/admin/users/:id/suspend and /unsuspend
exports.suspendUser = (req, res) => setSuspended(req, res, true);
exports.unsuspendUser = (req, res) => setSuspended(req, res, false);

// DELETE /api/admin/posts/:id: soft delete any post
exports.deletePostAsAdmin = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $set: { isDeleted: true } }, { returnDocument: "after" });
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json({ message: "Post removed by admin" });
  } catch (error) {
    return fail(res, error);
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, adminPosition, adminNote, isSuspended } = req.body || {};
    const isSelf = req.params.id === req.user.id;

    // An admin cannot lock themselves out by demoting or suspending their own account.
    if (isSelf && ((role && role !== "admin") || isSuspended === true)) {
      return res.status(400).json({ message: "You cannot demote or suspend your own account" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: {
        ...(name && { name }),
        ...(typeof email === "string" && email && { email: email.toLowerCase().trim() }),
        ...(role && { role }),
        ...(adminPosition !== undefined && { adminPosition }),
        ...(adminNote !== undefined && { adminNote }),
        ...(typeof isSuspended === "boolean" && { isSuspended }),
      }},
      { returnDocument: "after", runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(safeUser(user));
  } catch (error) {
    return fail(res, error);
  }
};

// PUT /api/admin/users/:id/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.params.id },
      { $set: cleanProfileInput(req.body) },
      { returnDocument: "after", runValidators: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res.json(profile);
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ message: error.message });
    return fail(res, error);
  }
};

// GET /api/admin/reports
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter", "name email")
      .populate("reportedUser", "name email")
      .populate("reportedPost", "text author")
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json(reports);
  } catch (error) {
    return fail(res, error);
  }
};

// PUT /api/admin/reports/:id: mark a report reviewed or dismissed
exports.updateReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: pick(req.body, ["status", "adminNote"]) },
      { returnDocument: "after", runValidators: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    return res.json(report);
  } catch (error) {
    return fail(res, error);
  }
};
