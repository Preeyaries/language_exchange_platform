// backend/utils/publicUser.js
// What other users are allowed to see about an account.
// Email addresses are private: the public "handle" is the part before the @.

function handleOf(email) {
  return email ? String(email).split("@")[0] : "user";
}

function publicUser(user, profile) {
  if (!user) return null;
  const out = { _id: user._id, name: user.name, handle: handleOf(user.email) };
  if (profile !== undefined) {
    out.gender = profile?.gender || "";
    out.profilePicture = profile?.profilePicture || null;
  }
  return out;
}

// Age band shown on profiles instead of the exact date of birth.
function ageRangeOf(dateOfBirth) {
  if (!dateOfBirth) return "";
  const age = Math.floor((Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
  if (Number.isNaN(age)) return "";
  if (age < 18) return "Under 18";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  if (age <= 54) return "45-54";
  return "55+";
}

module.exports = { handleOf, publicUser, ageRangeOf };
