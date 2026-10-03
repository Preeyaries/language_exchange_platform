const express = require("express");
const auth = require("../middleware/auth");
const { register, login, getMe, updateMe } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);

module.exports = router;
