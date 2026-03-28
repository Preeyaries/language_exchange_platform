import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

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

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(conversations); return; }
    const q = search.toLowerCase();
    setFiltered(conversations.filter(c =>
      c.otherUser?.name?.toLowerCase().includes(q)
    ));
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .msg-root {
          min-height: 100vh;
          background: #0f1c3f;
          font-family: 'Nunito', sans-serif;
          display: flex;
          justify-content: center;
        }

        .msg-phone {
          width: 100%;
          max-width: 390px;
          min-height: 100vh;
          background: #0f1c3f;
          padding-bottom: 90px;
        }

        /* Header */
        .msg-header {
          padding: 52px 20px 16px;
        }

        .msg-title {
          color: #fff;
          font-size: 26px;
          font-weight: 900;
          margin-bottom: 16px;
          letter-spacing: -0.3px;
        }

        /* Search */
        .msg-search-wrap {
          position: relative;
          margin-bottom: 8px;
        }

        .msg-search {
          width: 100%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 22px;
          padding: 12px 16px 12px 42px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .msg-search::placeholder { color: rgba(255,255,255,0.35); }
        .msg-search:focus {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.13);
        }

        .msg-search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.35);
          font-size: 16px;
          pointer-events: none;
        }

        /* Conversation list */
        .conv-list { padding: 8px 0; }

        .conv-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          position: relative;
        }

        .conv-item:hover { background: rgba(255,255,255,0.04); }
        .conv-item:active { background: rgba(255,255,255,0.07); }

        /* Avatar */
        .conv-avatar-wrap { position: relative; flex-shrink: 0; }

        .conv-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          color: white;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.1);
        }

        .conv-avatar img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        /* Language flag badge */
        .conv-flag {
          position: absolute;
          bottom: -2px;
          right: -2px;
          font-size: 14px;
          line-height: 1;
          background: #0f1c3f;
          border-radius: 50%;
          padding: 1px;
        }

        /* Online dot */
        .conv-online {
          position: absolute;
          top: 1px;
          right: 1px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #4ade80;
          border: 2px solid #0f1c3f;
        }

        /* Content */
        .conv-content { flex: 1; min-width: 0; }

        .conv-name {
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conv-preview {
          color: rgba(255,255,255,0.45);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conv-preview.unread { color: rgba(255,255,255,0.75); }

        /* Right side */
        .conv-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }

        .conv-time {
          color: rgba(255,255,255,0.3);
          font-size: 11px;
          font-weight: 700;
        }

        .conv-unread {
          background: #4a7fe0;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
        }

        /* Empty */
        .msg-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          font-weight: 600;
        }

        /* Loading */
        .msg-loading {
          text-align: center;
          padding: 40px;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          font-weight: 600;
        }

        /* Bottom nav */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 390px;
          background: linear-gradient(180deg, rgba(15,28,63,0) 0%, rgba(10,20,50,0.97) 30%);
          padding: 8px 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          z-index: 100;
        }

        .nav-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.4);
          font-size: 22px; cursor: pointer;
          padding: 8px 12px;
          transition: color 0.2s;
        }

        .nav-btn.active, .nav-btn:hover { color: #fff; }

        .nav-plus {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: #4a7fe0; border: none;
          color: white; font-size: 26px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(74,127,224,0.5);
          transition: transform 0.15s;
          margin-bottom: 4px;
        }

        .nav-plus:hover { transform: scale(1.08); }
      `}</style>

      <div className="msg-root">
        <div className="msg-phone">
          <div className="msg-header">
            <h1 className="msg-title">Messenger</h1>
            <div className="msg-search-wrap">
              <span className="msg-search-icon">🔍</span>
              <input
                className="msg-search"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="msg-loading">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="msg-empty">
              <p style={{ fontSize:32, marginBottom:8 }}>💬</p>
              <p>{search ? "No results found" : "No conversations yet"}</p>
            </div>
          ) : (
            <div className="conv-list">
              {filtered.map(conv => {
                const other  = conv.otherUser || {};
                const unread = conv.unreadCount || 0;
                const isOnline = conv.isOnline || false;
                const flag = LANG_FLAG[other.nativeLanguage] || "";

                return (
                  <div
                    key={conv._id || other._id}
                    className="conv-item"
                    onClick={() => navigate(`/messages/${other._id}`)}
                  >
                    <div className="conv-avatar-wrap">
                      <div className="conv-avatar">
                        {other.profilePicture
                          ? <img src={other.profilePicture} alt="" />
                          : (other.name || "U").charAt(0).toUpperCase()
                        }
                      </div>
                      {flag && <span className="conv-flag">{flag}</span>}
                      {isOnline && <div className="conv-online" />}
                    </div>

                    <div className="conv-content">
                      <div className="conv-name">{other.name || "User"}</div>
                      <div className={`conv-preview ${unread > 0 ? "unread" : ""}`}>
                        {conv.lastMessage?.text || "Say hello! 👋"}
                      </div>
                    </div>

                    <div className="conv-right">
                      <span className="conv-time">
                        {timeAgo(conv.lastMessage?.createdAt)}
                      </span>
                      {unread > 0 && (
                        <span className="conv-unread">{unread}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <nav className="bottom-nav">
          <Link to="/feed"><button className="nav-btn">🏠</button></Link>
          <Link to="/messages"><button className="nav-btn active">💬</button></Link>
          <button className="nav-plus" onClick={() => navigate("/posts/new")}>+</button>
          <Link to="/profile"><button className="nav-btn">👤</button></Link>
          <Link to="/matches"><button className="nav-btn">📋</button></Link>
        </nav>
      </div>
    </>
  );
}