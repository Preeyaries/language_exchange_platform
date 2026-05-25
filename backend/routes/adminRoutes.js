const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const {
  getAllUsers,
  suspendUser,
  unsuspendUser,
  deletePostAsAdmin,
  updateUser,
  updateUserProfile
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", auth, requireAdmin, getAllUsers);
router.put("/users/:id/suspend", auth, requireAdmin, suspendUser);
router.put("/users/:id/unsuspend", auth, requireAdmin, unsuspendUser);
router.delete("/posts/:id", auth, requireAdmin, deletePostAsAdmin);
router.put("/users/:id", auth, requireAdmin, updateUser);
router.put("/users/:id/profile", auth, requireAdmin, updateUserProfile);

module.exports = router;