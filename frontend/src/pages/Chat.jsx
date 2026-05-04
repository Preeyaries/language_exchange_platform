import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import PhoneFrame from "../components/PhoneFrame";
import { getAvatarUrl } from "../utils/avatarUrl";

function timeLabel(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}

const WAVE_HEIGHTS = [12,18,10,22,14,20,10,16,12,18,8,14];

export default function Chat() {
  const { id: otherUserId } = useParams();
  const navigate = useNavigate();

  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [text, setText]           = useState("");
  const [sending, setSending]     = useState(false);
  const [menuMsgId, setMenuMsgId] = useState(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const isFirstLoad = useRef(true);

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchOtherUser();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    if (!bottomRef.current) return;
    if (isFirstLoad.current) {
      bottomRef.current.scrollIntoView({ behavior: "instant" });
      isFirstLoad.current = false;
    } else {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

const fetchOtherUser = async () => {
  try {
    const res = await API.get(`/profile/${otherUserId}`);
    console.log("profile res:", JSON.stringify(res.data));
    setOtherUser(res.data.user || res.data);
  } catch {}
};

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${otherUserId}`);
      setMessages(res.data || []);
    } catch {}
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const optimistic = {
      _id: Date.now(),
      sender: me.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      pending: true,
    };
    setMessages(prev => [...prev, optimistic]);
    const sent = text.trim();
    setText("");
    try { await API.post(`/messages/${otherUserId}`, { text: sent }); fetchMessages(); }
    catch {} finally { setSending(false); }
  };

  const handleDelete = async (msgId) => {
    setMenuMsgId(null);
    try {
      await API.delete(`/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m._id !== msgId));
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const displayName = otherUser?.name || "User";
  const avatar      = otherUser?.profilePicture || null;
  const lastSeen    = "Last seen " + new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  return (
    <PhoneFrame light>
      {menuMsgId && <div className="fixed inset-0 z-40" onClick={() => setMenuMsgId(null)} />}

      {/* Header */}
      <div className="bg-[#1a2d6b] pt-8 pb-5 px-6 flex items-center gap-3 sticky top-0 z-50 shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
        <button onClick={() => navigate("/messages")}
          className="w-9 h-9 rounded-full bg-[#4a7fe0] border-0 text-white text-lg cursor-pointer flex items-center justify-center shrink-0 hover:bg-[#5a8ff0] transition-colors">
          ←
        </button>
        <img
          src={getAvatarUrl(otherUser?.profilePicture, otherUserId, otherUser?.gender)}
          alt=""
          className="w-[42px] h-[42px] rounded-full border-2 border-white/20 object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-white text-[15px] font-extrabold truncate">{displayName}</div>
          <div className="text-white/50 text-xs font-semibold mt-0.5">{lastSeen}</div>
        </div>
        <button onClick={() => navigate(`/profile/${otherUserId}`)}
          className="bg-transparent border-0 text-white/50 text-2xl cursor-pointer px-2 py-1 leading-none hover:text-white transition-colors">⋮</button>
      </div>

      {/* Messages — flex-1 + overflow-y-auto */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 flex flex-col gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Spacer ดันข้อความลงล่าง */}
        <div className="flex-1 min-h-4" />

        {messages.length === 0 && (
          <div className="text-center text-black/30 text-[13px] font-semibold py-8">
            <p className="text-4xl mb-2">👋</p>
            <p>Say hello to {displayName}!</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMine   = String(msg.sender) === String(me.id) || String(msg.sender?._id) === String(me.id);
          const isVoice  = msg.voiceNoteUrl;
          const showMenu = menuMsgId === msg._id;

          return (
            <div key={msg._id || i}
              className={`flex flex-col max-w-[72%] relative ${isMine ? "self-end items-end" : "self-start items-start"}`}>

              {isVoice ? (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-[18px] min-w-[140px]
                  ${isMine ? "bg-[#4a7fe0] text-white rounded-br-[4px]" : "bg-white text-[#1a2d6b] rounded-bl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"}`}>
                  <button className="w-7 h-7 rounded-full bg-white/25 border-0 flex items-center justify-center text-xs cursor-pointer shrink-0 text-white">▶</button>
                  <div className="flex items-center gap-0.5 flex-1">
                    {WAVE_HEIGHTS.map((h, j) => (
                      <div key={j} className="w-[3px] rounded-sm bg-white/60"
                        style={{ height:h, animation:`wavePulse 1.2s ease-in-out ${j*0.08}s infinite` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => isMine && setMenuMsgId(showMenu ? null : msg._id)}
                  className={`px-[15px] py-[11px] rounded-[18px] text-sm font-semibold leading-[1.5] break-words
                    ${isMine
                      ? "bg-[#4a7fe0] text-white rounded-br-[4px] cursor-pointer hover:bg-[#3a6fd0]"
                      : "bg-white text-[#1a2d6b] rounded-bl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"}
                    ${msg.pending ? "opacity-70" : ""}`}>
                  {msg.text}
                </div>
              )}

              <span className={`text-[11px] font-semibold mt-1 px-1 ${isMine ? "text-black/30" : "text-black/30"}`}>
                {timeLabel(msg.createdAt)}
              </span>

              {/* Delete menu */}
              {showMenu && isMine && (
                <div className="absolute z-50 bottom-8 right-0 bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden min-w-[130px]">
                  <button onClick={() => handleDelete(msg._id)}
                    className="flex items-center gap-2.5 px-4 py-3 w-full bg-transparent border-0 text-red-500 text-sm font-bold cursor-pointer text-left hover:bg-red-50 transition-colors">
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
<div className="bg-white mx-4 mb-4 px-4 pr-3 py-3 flex items-center gap-2 shadow-lg shrink-0 rounded-full">      
          {["📷","🖼","🎙"].map((icon, i) => (
            <button key={i}
              className="w-[38px] h-[38px] rounded-full bg-[#e8eef8] border-0 flex items-center justify-center text-[17px] cursor-pointer shrink-0 text-[#1a2d6b] hover:bg-[#d0daf0] transition-colors">
              {icon}
            </button>
          ))}
          <input
            ref={inputRef}
            placeholder="Message"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-[#f0f4fb] border-0 rounded-full py-2.5 px-4 text-[#1a2d6b] text-sm font-semibold outline-none placeholder:text-[#aab4cc]"
          />
          <button onClick={handleSend} disabled={sending || !text.trim()}
            className="w-[38px] h-[38px] rounded-full bg-[#4a7fe0] border-0 flex items-center justify-center text-[17px] cursor-pointer shrink-0 text-white
              hover:bg-[#5a8ff0] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            ➤
          </button>
      </div>

      <style>{`
        @keyframes wavePulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }
      `}</style>
    </PhoneFrame>
  );
}