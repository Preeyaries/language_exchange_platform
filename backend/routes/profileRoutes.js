// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createProfile,
  getMyProfile,
  getProfileById,
  updateMyProfile,
} = require("../controllers/profileController");
 
router.post("/", auth, createProfile);
router.get("/", auth, getMyProfile);
router.get("/:id", auth, getProfileById);   // ← ดู profile คนอื่น
router.put("/", auth, updateMyProfile);
 
module.exports = router;
 