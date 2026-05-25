// backend/routes/matchRoutes.js
// Design Pattern: MIDDLEWARE Pattern
// Reason: All routes are protected by the `auth` middleware —
//         requests must pass JWT authentication before reaching the controller.

const express = require("express");
const auth    = require("../middleware/auth");
const { getMatches, searchUsers } = require("../controllers/matchController");

const router = express.Router();

router.get("/",        auth, getMatches);    // GET /api/matches
router.get("/search",  auth, searchUsers);   // GET /api/matches/search?q=...

module.exports = router;