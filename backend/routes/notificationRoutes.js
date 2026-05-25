const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead,
} = require("../controllers/notificationController");

router.get("/",              auth, getNotifications);
router.get("/unread-count",  auth, getUnreadCount);
router.put("/mark-all-read", auth, markAllRead);
router.put("/:id/read",      auth, markOneRead);
module.exports = router;
