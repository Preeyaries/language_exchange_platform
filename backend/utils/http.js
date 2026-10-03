// backend/utils/http.js
// Shared helpers for controllers.

const mongoose = require("mongoose");

// Send the right status for an error caught in a controller.
// Validation problems are the client's fault (400). Anything else is logged
// on the server and reported without internal details.
function fail(res, error) {
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ message: error.message });
  }
  if (error && error.code === 11000) {
    return res.status(400).json({ message: "That value is already in use" });
  }
  if (process.env.NODE_ENV !== "test") console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}

// Copy only the allowed keys from a request body. Used wherever a body is
// written to the database, so a client cannot set fields such as `author`,
// `likes` or `user` by adding them to the JSON.
function pick(body, allowed) {
  const out = {};
  for (const key of allowed) {
    if (body && body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

// Escape user input before using it inside a regular expression.
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Accept only http(s) links for media fields (or an empty value).
function isHttpUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const isObjectId = (value) => mongoose.isValidObjectId(value) && String(value).length === 24;

module.exports = { fail, pick, escapeRegex, isHttpUrl, isObjectId };
