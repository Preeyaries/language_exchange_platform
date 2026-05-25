import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import PhoneFrame from "../components/PhoneFrame";

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const TYPE_ICON = {
  like:    "❤️",
  comment: "💬",
  follow:  "👤",
  message: "✉️",
};

const TYPE_TEXT = {
  like:    "liked your post",
  comment: "commented on your post",
  follow:  "started following you",
  message: "sent you a message",
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data || []);
      await API.put("/notifications/mark-all-read");
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="w-full bg-gradient-to-br from-[#1a3575] via-[#1a2d6b] to-[#162860] min-h-full pb-24">

          {/* header */}
          <div className="sticky top-0 z-50 bg-[#0f1c3f] px-6 py-5 border-b border-white/[0.06] flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-transparent border-0 text-white/60 text-xl cursor-pointer p-0 leading-none"
            >
              ‹
            </button>
            <h1 className="text-white text-[17px] font-extrabold m-0">Notifications</h1>
          </div>

          {/* list */}
          <div className="max-w-[390px] mx-auto">
            {loading ? (
              <div className="flex justify-center p-10 text-sm text-white/30">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center text-sm text-white/30">
                <p className="text-4xl mb-2">🔔</p>
                <p>No notifications yet</p>
              </div>
            ) : notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => {
                  if (n.type === "message") navigate("/messages");
                  else if (n.post) navigate(`/feed`);
                  else if (n.type === "follow") navigate(`/profile/${n.sender?._id}`);
                }}
                className={`flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] cursor-pointer transition-colors hover:bg-white/5
                  ${!n.read ? "bg-white/[0.04]" : ""}`}
              >
                {/* the dot that shows that it be unread */}
                <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: !n.read ? "#4a7fe0" : "transparent" }} />

                {/* icon */}
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
                  {TYPE_ICON[n.type]}
                </div>

                {/* text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white m-0 leading-snug">
                    <span className="text-[#4a7fe0]">{n.sender?.name || "Someone"}</span>
                    {" "}{TYPE_TEXT[n.type]}
                  </p>
                  {n.post?.text && (
                    <p className="text-xs text-white/40 font-semibold mt-0.5 truncate">
                      "{n.post.text}"
                    </p>
                  )}
                </div>

                {/* time */}
                <span className="text-xs text-white/30 font-semibold shrink-0">
                  {timeAgo(n.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}
