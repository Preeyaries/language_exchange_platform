// frontend/src/utils/avatarUrl.js
// Design Pattern: FACADE Pattern
// Reason: Hides the complexity of avatar URL generation behind a simple function.
//         All components use this single function — consistent behavior across the app.

export function getAvatarUrl(profilePicture, userId, gender) {
  if (profilePicture) return profilePicture;
  const index = Math.abs(
    (userId || "default").split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  ) % 99 + 1;
  return `https://randomuser.me/api/portraits/${gender === "Female" ? "women" : "men"}/${index}.jpg`;
}