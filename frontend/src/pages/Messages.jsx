import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import PhoneFrame from "../components/PhoneFrame";
import { getAvatarUrl } from "../utils/avatarUrl";

const LANG_FLAG = {
  English:"🇬🇧", Thai:"🇹🇭", Japanese:"🇯🇵", Korean:"🇰🇷",
  "Chinese (Mandarin)":"🇨🇳", French:"🇫🇷", German:"🇩🇪",
  Spanish:"🇪🇸", Italian:"🇮🇹", Portuguese:"🇵🇹",
  Arabic:"🇸🇦", Hindi:"🇮🇳", Russian:"🇷🇺", Vietnamese:"🇻🇳",
};

function timeAgo(date) {
  if (!date) return "";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "now";
  if (diff < 3600)  return `${Math.floor(diff/60)}m`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  return `${Math.floor(diff/86400)}d`;
}

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(true);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(conversations); return; }
    const q = search.toLowerCase();
    setFiltered(conversations.filter(c => c.otherUser?.name?.toLowerCase().includes(q)));
  }, [search, conversations]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await API.get("/messages/conversations");
      setConversations(res.data || []);
      setFiltered(res.data || []);
    } catch {
      setConversations([]);
      setFiltered([]);
    } finally { setLoading(false); }
  };

  return (
    <PhoneFrame>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full px-4 py-3 bg-gradient-to-br ]">

            {/* Header */}
            <div className="px-5 pt-12 pb-3">
              <h1 className="text-white text-[26px] font-black tracking-tight mb-4">Messenger</h1>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 text-base pointer-events-none">🔍</span>
                <input
                  placeholder="Search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-full py-3 pl-10 pr-4
                    text-white text-sm font-semibold outline-none placeholder:text-white/35
                    focus:border-white/25 focus:bg-white/13 transition-all"
                />
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="text-center py-10 text-white/30 text-sm font-semibold">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-5 text-white/30 text-sm font-semibold">
                <p className="text-4xl mb-2">💬</p>
                <p>{search ? "No results found" : "No conversations yet"}</p>
              </div>
            ) : (
              <div className="py-2">
                {filtered.map(conv => {
                  const other    = conv.otherUser || {};
                  const unread   = conv.unreadCount || 0;
                  const isOnline = conv.isOnline || false;
                  const flag     = LANG_FLAG[other.nativeLanguage] || "";

                  return (
                    <div key={conv._id || other._id}
                      onClick={() => navigate(`/messages/${other._id}`)}
                      className="flex items-center gap-3.5 px-5 py-3.5 cursor-pointer border-b border-white/[0.05]
                        hover:bg-white/[0.04] active:bg-white/[0.07] transition-colors">

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-[54px] h-[54px] rounded-full bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f]
                          flex items-center justify-center text-xl font-extrabold text-white border-2 border-white/10 overflow-hidden">
                          {other.profilePicture
                            ? <img src={other.profilePicture} alt="" className="w-full h-full object-cover" />
                            : (other.name || "U").charAt(0).toUpperCase()
                          }
                        </div>
                        {flag && (
                          <span className="absolute -bottom-0.5 -right-0.5 text-sm leading-none bg-[#0f1c3f] rounded-full p-px">
                            {flag}
                          </span>
                        )}
                        {isOnline && (
                          <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0f1c3f]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-[15px] font-extrabold mb-1 truncate">{other.name || "User"}</div>
                        <div className={`text-sm font-semibold truncate ${unread > 0 ? "text-white/75" : "text-white/45"}`}>
                          {conv.lastMessage?.text || "Say hello! 👋"}
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-white/30 text-[11px] font-bold">{timeAgo(conv.lastMessage?.createdAt)}</span>
                        {unread > 0 && (
                          <span className="bg-[#4a7fe0] text-white text-[11px] font-extrabold min-w-5 h-5 rounded-full flex items-center justify-center px-1.5">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      <BottomNav />
    </PhoneFrame>
  );
}