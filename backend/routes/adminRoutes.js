const express = require("express");
const auth = require("../middleware/auth");
const requireAdmin = require("../middleware/requireAdmin");
const validateObjectId = require("../middleware/validateObjectId");
const {
  getAllUsers, suspendUser, unsuspendUser, deletePostAsAdmin,
  updateUser, updateUserProfile, getReports, updateReport,
} = require("../controllers/adminController");

const router = express.Router();

router.param("id", validateObjectId);
// Every admin route needs a valid token and the admin role.
router.use(auth, requireAdmin);

router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/unsuspend", unsuspendUser);
router.put("/users/:id/profile", updateUserProfile);
router.delete("/posts/:id", deletePostAsAdmin);
router.get("/reports", getReports);
router.put("/reports/:id", updateReport);

module.exports = router;
