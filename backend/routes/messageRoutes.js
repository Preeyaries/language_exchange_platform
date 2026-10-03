const express = require("express");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const {
  getConversations, getMessages, sendMessage, deleteMessage,
} = require("../controllers/messageController");

const router = express.Router();
router.param("userId", validateObjectId);
router.param("messageId", validateObjectId);

router.get("/conversations", auth, getConversations);
router.get("/:userId",       auth, getMessages);
router.post("/:userId",      auth, sendMessage);
router.delete("/:messageId", auth, deleteMessage);

module.exports = router;
