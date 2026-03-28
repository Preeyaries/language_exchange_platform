import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

function timeLabel(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
}

export default function Chat() {
  const { id: otherUserId } = useParams();
  const navigate = useNavigate();

  const [otherUser, setOtherUser]   = useState(null);
  const [messages, setMessages]     = useState([]);
  const [text, setText]             = useState("");
  const [sending, setSending]       = useState(false);
  const bottomRef                   = useRef(null);
  const inputRef                    = useRef(null);

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchOtherUser();
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchOtherUser = async () => {
    try {
      const res = await API.get(`/profile/${otherUserId}`);
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
    setText("");
    try {
      await API.post(`/messages/${otherUserId}`, { text: text.trim() });
      fetchMessages();
    } catch {}
    finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName   = otherUser?.name || "User";
  const avatar        = otherUser?.profilePicture || null;
  const lastSeen      = "Last seen " + new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .chat-root {
          min-height: 100vh;
          background: #e8eef8;
          font-family: 'Nunito', sans-serif;
          display: flex;
          justify-content: center;
        }

        .chat-phone {
          width: 100%;
          max-width: 390px;
          min-height: 100vh;
          background: #e8eef8;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .chat-header {
          background: #1a2d6b;
          padding: 48px 16px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 2px 16px rgba(0,0,0,0.2);
        }

        .chat-back {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #4a7fe0;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s;
        }

        .chat-back:hover { background: #5a8ff0; }

        .chat-header-avatar {
          width: 42px; height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; font-weight: 800; color: white;
          flex-shrink: 0; overflow: hidden;
          border: 2px solid rgba(255,255,255,0.2);
        }

        .chat-header-avatar img { width:100%; height:100%; object-fit:cover; }

        .chat-header-info { flex: 1; }

        .chat-header-name {
          color: #fff;
          font-size: 15px;
          font-weight: 800;
        }

        .chat-header-status {
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          font-weight: 600;
          margin-top: 1px;
        }

        /* Messages area */
        .chat-messages {
          flex: 1;
          padding: 16px 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
        }

        /* Bubble */
        .bubble-wrap {
          display: flex;
          flex-direction: column;
          max-width: 72%;
        }

        .bubble-wrap.mine {
          align-self: flex-end;
          align-items: flex-end;
        }

        .bubble-wrap.theirs {
          align-self: flex-start;
          align-items: flex-start;
        }

        .bubble {
          padding: 11px 15px;
          border-radius: 18px;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.5;
          word-break: break-word;
        }

        .bubble.mine {
          background: #4a7fe0;
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .bubble.theirs {
          background: #fff;
          color: #1a2d6b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* Voice note bubble */
        .bubble.voice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          min-width: 140px;
        }

        .voice-play {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; cursor: pointer; flex-shrink: 0;
          border: none; color: white;
        }

        .voice-waves {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
        }

        .voice-bar {
          width: 3px;
          border-radius: 2px;
          background: rgba(255,255,255,0.6);
          animation: wavePulse 1.2s ease-in-out infinite;
        }

        @keyframes wavePulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }

        .bubble-time {
          color: rgba(0,0,0,0.3);
          font-size: 11px;
          font-weight: 600;
          margin-top: 3px;
          padding: 0 4px;
        }

        .bubble-wrap.mine .bubble-time { color: rgba(255,255,255,0.5); }

        /* Input bar */
        .chat-input-bar {
          background: #fff;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
          position: sticky;
          bottom: 0;
        }

        .chat-input-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: #e8eef8;
          border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
          color: #1a2d6b;
        }

        .chat-input-btn:hover { background: #d0daf0; }

        .chat-input {
          flex: 1;
          background: #f0f4fb;
          border: none;
          border-radius: 22px;
          padding: 10px 16px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #1a2d6b;
          outline: none;
          resize: none;
          max-height: 100px;
          overflow-y: auto;
        }

        .chat-input::placeholder { color: #aab4cc; }

        .chat-send {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: #4a7fe0;
          border: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s, transform 0.15s;
          color: white;
        }

        .chat-send:hover:not(:disabled) { background: #5a8ff0; transform: scale(1.05); }
        .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Date separator */
        .date-sep {
          text-align: center;
          color: rgba(0,0,0,0.3);
          font-size: 12px;
          font-weight: 700;
          margin: 8px 0;
        }
      `}</style>

      <div className="chat-root">
        <div className="chat-phone">

          {/* Header */}
          <div className="chat-header">
            <button className="chat-back" onClick={() => navigate("/messages")}>←</button>

            <div className="chat-header-avatar">
              {avatar
                ? <img src={avatar} alt="" />
                : displayName.charAt(0).toUpperCase()
              }
            </div>

            <div className="chat-header-info">
              <div className="chat-header-name">{displayName}</div>
              <div className="chat-header-status">{lastSeen}</div>
            </div>

            <button
              onClick={() => navigate(`/profile/${otherUserId}`)}
              style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:22, cursor:"pointer", padding:"4px 8px" }}
            >
              ⋮
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign:"center", color:"rgba(0,0,0,0.3)", fontSize:13, fontWeight:600, marginTop:40 }}>
                <p style={{ fontSize:32, marginBottom:8 }}>👋</p>
                <p>Say hello to {displayName}!</p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isMine = String(msg.sender) === String(me.id) || String(msg.sender?._id) === String(me.id);
              const isVoice = msg.voiceNoteUrl;

              return (
                <div key={msg._id || i} className={`bubble-wrap ${isMine ? "mine" : "theirs"}`}>
                  {isVoice ? (
                    <div className={`bubble voice ${isMine ? "mine" : "theirs"}`}>
                      <button className="voice-play">▶</button>
                      <div className="voice-waves">
                        {[12,18,10,22,14,20,10,16,12,18,8,14].map((h,j) => (
                          <div key={j} className="voice-bar" style={{
                            height: h, animationDelay: `${j*0.08}s`
                          }}/>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={`bubble ${isMine ? "mine" : "theirs"}`} style={{ opacity: msg.pending ? 0.7 : 1 }}>
                      {msg.text}
                    </div>
                  )}
                  <span className="bubble-time">{timeLabel(msg.createdAt)}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="chat-input-bar">
            <button className="chat-input-btn" title="Camera">📷</button>
            <button className="chat-input-btn" title="Gallery">🖼</button>
            <button className="chat-input-btn" title="Voice">🎙</button>
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Message"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chat-send" onClick={handleSend} disabled={sending || !text.trim()}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  );
}