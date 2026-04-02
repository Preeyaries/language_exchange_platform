// backend/app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes    = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const postRoutes    = require("./routes/postRoutes");
const reportRoutes  = require("./routes/reportRoutes");
const adminRoutes   = require("./routes/adminRoutes");
const followRoutes  = require("./routes/followRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://13.210.234.249",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

app.use("/api/auth",     authRoutes);
app.use("/api/profile",  profileRoutes);
app.use("/api/posts",    postRoutes);
app.use("/api/reports",  reportRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/follow",   followRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => res.send("API is running"));

// Connect DB only if not in test (tests connect their own)
if (process.env.NODE_ENV !== "test") {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));
}

module.exports = app;