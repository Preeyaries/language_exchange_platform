module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large" });
  }

  const statusCode = err.statusCode || 500;
  if (statusCode >= 500 && process.env.NODE_ENV !== "test") console.error(err);
  return res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : err.message,
  });
};
