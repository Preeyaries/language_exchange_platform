// backend/app.js
// Builds the Express app. The database connection is opened by server.js
// (and by the test setup), so this file can be imported without side effects.
require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes    = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const postRoutes    = require("./routes/postRoutes");
const adminRoutes   = require("./routes/adminRoutes");
const followRoutes  = require("./routes/followRoutes");
const messageRoutes = require("./routes/messageRoutes");
const matchRoutes   = require("./routes/matchRoutes");
const reportRoutes  = require("./routes/reportRoutes");
const errorHandler  = require("./middleware/errorHandler");

const app = express();

// The app runs behind Nginx, so the client IP is in X-Forwarded-For.
app.set("trust proxy", 1);
app.use(helmet());

// CLIENT_URL is a comma-separated list of allowed origins.
// When it is not set (local development) every origin is allowed.
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "100kb" }));

// Slow down password guessing and mass sign-ups.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
  skip: () => process.env.NODE_ENV === "test",
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api/auth",     authRoutes);
app.use("/api/profile",  profileRoutes);
app.use("/api/posts",    postRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/follow",   followRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/matches",  matchRoutes);
app.use("/api/reports",  reportRoutes);

app.get("/", (req, res) => res.send("API is running"));

app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use(errorHandler);

module.exports = app;
