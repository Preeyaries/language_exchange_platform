const express = require("express");
const auth = require("../middleware/auth");
const { register, login, getMe } = require("../controllers/authController");
const User = require("../models/User")

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.put("/me", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name } },
      { new: true }
    ).select("-passwordHash");
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;