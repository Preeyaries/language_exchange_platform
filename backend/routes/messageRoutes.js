const express    = require("express");
const router     = express.Router();
const auth       = require("../middleware/auth");
const {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
} = require("../controllers/messageController");
 
router.get("/conversations",    auth, getConversations);
router.get("/:userId",          auth, getMessages);
router.post("/:userId",         auth, sendMessage);
router.delete("/:messageId",    auth, deleteMessage);
 
module.exports = router;
 