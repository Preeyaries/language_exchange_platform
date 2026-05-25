const Report = require("../models/Report");

exports.createReport = async (req, res) => {
  try {
    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: req.body.reportedUser || null,
      reportedPost: req.body.reportedPost || null,
      reason: req.body.reason,
    });

    return res.status(201).json(report);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};