const express = require("express");
const router = express.Router();
const { followUser, unfollowUser, followStatus } = require("../controllers/followController");
const auth = require("../middleware/auth");  // ← เปลี่ยนตรงนี้

router.post("/:id", auth, followUser);
router.delete("/:id", auth, unfollowUser);
router.get("/status/:id", auth, followStatus);

module.exports = router;