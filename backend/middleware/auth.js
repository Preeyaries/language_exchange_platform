const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT, then checks the account in the database on every request.
// The role comes from the database, not the token, so a suspended user or a
// demoted admin loses access immediately instead of when the token expires.
module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    const user = await User.findById(decoded.id).select("role isSuspended");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    if (user.isSuspended) {
      return res.status(403).json({ message: "Your account has been suspended" });
    }
    req.user = { id: String(user._id), role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
};
