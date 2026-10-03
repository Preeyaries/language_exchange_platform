const express = require("express");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const {
  createProfile, getMyProfile, getProfileById, updateMyProfile,
} = require("../controllers/profileController");

const router = express.Router();
router.param("id", validateObjectId);

router.post("/",   auth, createProfile);
router.get("/",    auth, getMyProfile);
router.get("/:id", auth, getProfileById);
router.put("/",    auth, updateMyProfile);

module.exports = router;
