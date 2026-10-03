const express = require("express");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { followUser, unfollowUser, followStatus } = require("../controllers/followController");

const router = express.Router();
router.param("id", validateObjectId);

router.post("/:id", auth, followUser);
router.delete("/:id", auth, unfollowUser);
router.get("/status/:id", auth, followStatus);

module.exports = router;
