const { isObjectId } = require("../utils/http");

// Router param handler: reject malformed ids with 400 instead of letting
// Mongoose throw a cast error deeper in the controller.
module.exports = function validateObjectId(req, res, next, value) {
  if (!isObjectId(value)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  return next();
};
