const express = require("express");
const auth = require("../middleware/auth");
const { createReport } = require("../controllers/reportController");

const router = express.Router();

router.post("/", auth, createReport);

module.exports = router;