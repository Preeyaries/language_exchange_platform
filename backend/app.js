// backend/app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes    = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const postRoutes    = require("./routes/postRoutes");
const adminRoutes   = require("./routes/adminRoutes");
const followRoutes  = require("./routes/followRoutes");
const messageRoutes = require("./routes/messageRoutes");
const matchRoutes   = require("./routes/matchRoutes");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use("/api/auth",     authRoutes);
app.use("/api/profile",  profileRoutes);
app.use("/api/posts",    postRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/follow",   followRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/matches",  matchRoutes);

app.get("/", (req, res) => res.send("API is running"));

if (process.env.NODE_ENV !== "test") {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB error:", err));
}

module.exports = app;