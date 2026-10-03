const Report = require("../models/Report");
const { fail, isObjectId } = require("../utils/http");

// POST /api/reports: report a user or a post
exports.createReport = async (req, res) => {
  try {
    const { reportedUser, reportedPost } = req.body || {};
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim().slice(0, 500) : "";

    if (!reason) return res.status(400).json({ message: "A reason is required" });
    if (!reportedUser && !reportedPost) {
      return res.status(400).json({ message: "Choose a user or a post to report" });
    }
    if ((reportedUser && !isObjectId(reportedUser)) || (reportedPost && !isObjectId(reportedPost))) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: reportedUser || undefined,
      reportedPost: reportedPost || undefined,
      reason,
    });
    return res.status(201).json(report);
  } catch (error) {
    return fail(res, error);
  }
};
