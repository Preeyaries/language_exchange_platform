import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

const LANG_FLAG = {
  English: "🇬🇧", Thai: "🇹🇭", Japanese: "🇯🇵", Korean: "🇰🇷",
  "Chinese (Mandarin)": "🇨🇳", "Chinese (Cantonese)": "🇨🇳",
  French: "🇫🇷", German: "🇩🇪", Spanish: "🇪🇸", Italian: "🇮🇹",
  Portuguese: "🇵🇹", Arabic: "🇸🇦", Hindi: "🇮🇳", Russian: "🇷🇺",
  Vietnamese: "🇻🇳", Indonesian: "🇮🇩", Malay: "🇲🇾",
  Dutch: "🇳🇱", Swedish: "🇸🇪", Polish: "🇵🇱",
};

const LANGUAGES = ["All", "English", "Thai", "Japanese", "Korean",
  "Chinese (Mandarin)", "French", "German", "Spanish", "Vietnamese"];

const LEVEL_FILLED = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:5 };

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff/60)} mins`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hrs`;
  return `${Math.floor(diff/86400)} days`;
}

function LangBar({ nativeLang, learningLangs = [] }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      {nativeLang && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <span style={{ fontSize:16 }}>{LANG_FLAG[nativeLang] || "🌐"}</span>
          <span style={{ color:"rgba(255,255,255,0.8)", fontSize:10, fontWeight:800 }}>{nativeLang.slice(0,2).toUpperCase()}</span>
          <div style={{ display:"flex", gap:2 }}>
            {[1,2,3,4,5].map(i=><div key={i} style={{ width:5,height:5,borderRadius:"50%",background:"#4ade80" }}/>)}
          </div>
        </div>
      )}
      {learningLangs.length > 0 && <span style={{ color:"rgba(255,255,255,0.35)", fontSize:12 }}>⇌</span>}
      {learningLangs.map((l,i) => {
        const filled = LEVEL_FILLED[l.level] || 1;
        return (
          <span key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
            {i > 0 && <span style={{ width:1, height:24, background:"rgba(255,255,255,0.15)", display:"inline-block" }}/>}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <span style={{ fontSize:16 }}>{LANG_FLAG[l.language] || "🌐"}</span>
              <span style={{ color:"rgba(255,255,255,0.8)", fontSize:10, fontWeight:800 }}>{l.language.slice(0,2).toUpperCase()}</span>
              <div style={{ display:"flex", gap:2 }}>
                {[1,2,3,4,5].map(d=><div key={d} style={{ width:5,height:5,borderRadius:"50%",background: d<=filled?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.18)" }}/>)}
              </div>
            </div>
          </span>
        );
      })}
    </div>
  );
}

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [activeLang, setActiveLang] = useState("All");
  const [activeTab, setActiveTab]   = useState("all"); // "all" | "following"
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchRef = useRef(null);

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { fetchPosts(); fetchFollowing(); }, []);

  useEffect(() => { applyFilters(); }, [posts, search, activeLang, activeTab, followingIds]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/posts");
      setPosts(res.data || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  const fetchFollowing = async () => {
    try {
      const res = await API.get("/profile");
      // get following list from user model
      const meRes = await API.get("/auth/me");
      setFollowingIds(new Set((meRes.data.following || []).map(String)));
    } catch {}
  };

  const applyFilters = () => {
    let result = [...posts];

    // Tab filter
    if (activeTab === "following") {
      result = result.filter(p => followingIds.has(String(p.author?._id)));
    }

    // Language filter
    if (activeLang !== "All") {
      result = result.filter(p =>
        p.nativeLanguage === activeLang || p.learningLanguage === activeLang
      );
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.text?.toLowerCase().includes(q) ||
        p.author?.name?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  };

  const toggleLike = (postId) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .feed-root {
          min-height: 100vh;
          background: #0f1c3f;
          font-family: 'Nunito', sans-serif;
          display: flex;
          justify-content: center;
        }

        .feed-phone {
          width: 100%;
          max-width: 390px;
          min-height: 100vh;
          background: #0f1c3f;
          padding-bottom: 90px;
        }

        /* Top bar */
        .feed-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: #0f1c3f;
          padding: 14px 16px 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .feed-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #1a2d6b;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }

        .feed-search-wrap {
          flex: 1;
          position: relative;
        }

        .feed-search {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 22px;
          padding: 10px 16px 10px 38px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .feed-search::placeholder { color: rgba(255,255,255,0.3); }
        .feed-search:focus {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.12);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.35);
          font-size: 14px;
          pointer-events: none;
        }

        /* Tabs */
        .feed-tabs {
          display: flex;
          gap: 0;
          padding: 12px 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .feed-tab {
          flex: 1;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 800;
          padding: 8px 0 12px;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }

        .feed-tab.active { color: #fff; }

        .feed-tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 20%;
          width: 60%;
          height: 2.5px;
          border-radius: 2px;
          background: #4a7fe0;
        }

        /* Language filter chips */
        .lang-filter-wrap {
          padding: 12px 16px;
          overflow-x: auto;
          scrollbar-width: none;
          display: flex;
          gap: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .lang-filter-wrap::-webkit-scrollbar { display: none; }

        .lang-chip {
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 6px 14px;
          color: rgba(255,255,255,0.55);
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .lang-chip.active {
          background: #4a7fe0;
          border-color: #4a7fe0;
          color: #fff;
        }

        /* Post card */
        .feed-post {
          padding: 16px 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          animation: fadeUp 0.3s ease both;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .post-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }

        .post-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
          cursor: pointer;
        }

        .post-meta { flex: 1; }

        .post-name {
          color: #fff;
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 1px;
          cursor: pointer;
        }

        .post-name:hover { text-decoration: underline; }

        .post-handle {
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .post-time {
          color: rgba(255,255,255,0.35);
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        /* Post body */
        .post-text {
          color: rgba(255,255,255,0.85);
          font-size: 14px;
          font-weight: 600;
          line-height: 1.55;
          margin-bottom: 10px;
        }

        /* Translation box */
        .post-translation {
          background: rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 12px 14px;
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          font-weight: 600;
          font-style: italic;
          line-height: 1.5;
          margin-bottom: 10px;
          border-left: 3px solid #4a7fe0;
        }

        /* Topics */
        .post-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 8px;
        }

        .post-topic-chip {
          background: rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 4px 12px;
          color: rgba(255,255,255,0.55);
          font-size: 11px;
          font-weight: 700;
        }

        /* Likes row */
        .post-likes-row {
          display: flex;
          justify-content: flex-end;
          color: rgba(255,255,255,0.3);
          font-size: 12px;
          font-weight: 700;
          padding-bottom: 6px;
        }

        /* Actions */
        .post-actions {
          display: flex;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 0 -16px;
          padding: 0 16px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: none;
          border: none;
          color: rgba(255,255,255,0.45);
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 0;
          cursor: pointer;
          transition: color 0.2s;
        }

        .action-btn:hover { color: rgba(255,255,255,0.8); }
        .action-btn.liked { color: #f87171; }

        .action-sep {
          width: 1px;
          background: rgba(255,255,255,0.06);
          margin: 6px 0;
        }

        /* Empty state */
        .feed-empty {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          font-weight: 600;
        }

        /* Loading */
        .feed-loading {
          display: flex;
          justify-content: center;
          padding: 40px;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
          font-weight: 600;
        }

        /* Drawer overlay */
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 200;
          backdrop-filter: blur(3px);
          animation: fadeIn 0.2s ease both;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* Sidebar drawer */
        .drawer {
          position: fixed;
          top: 0;
          left: calc(50% - 195px);
          height: 100%;
          width: 292px;
          background: linear-gradient(180deg, #1a3575 0%, #0f1c3f 100%);
          z-index: 201;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 32px rgba(0,0,0,0.5);
          animation: slideIn 0.25s cubic-bezier(0.25,0.46,0.45,0.94) both;
        }

        @media (max-width: 390px) {
          .drawer {
            left: 0;
            width: 75vw;
          }
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 52px 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .drawer-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
        }

        .drawer-user-name {
          color: #fff;
          font-size: 15px;
          font-weight: 800;
        }

        .drawer-user-handle {
          color: rgba(255,255,255,0.4);
          font-size: 12px;
          font-weight: 600;
          margin-top: 2px;
        }

        .drawer-menu { flex: 1; padding: 12px 0; overflow-y: auto; }

        .drawer-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          color: rgba(255,255,255,0.75);
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
        }

        .drawer-item:hover {
          background: rgba(255,255,255,0.07);
          color: #fff;
        }

        .drawer-item-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .drawer-sep {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 8px 20px;
        }

        .drawer-item.logout {
          color: #ff8fa3;
          margin-top: 4px;
        }

        .drawer-item.logout .drawer-item-icon {
          background: rgba(255,100,100,0.12);
        }

        .drawer-item.logout:hover {
          background: rgba(255,100,100,0.08);
          color: #ff8fa3;
        }

        .drawer-footer {
          padding: 16px 20px 32px;
          color: rgba(255,255,255,0.2);
          font-size: 11px;
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
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 22px;
          cursor: pointer;
          padding: 8px 12px;
          transition: color 0.2s;
        }

        .nav-btn:hover, .nav-btn.active { color: #fff; }

        .nav-plus {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #4a7fe0;
          border: none;
          color: white;
          font-size: 26px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(74,127,224,0.5);
          transition: transform 0.15s;
          margin-bottom: 4px;
        }

        .nav-plus:hover { transform: scale(1.08); }
      `}</style>

      <div className="feed-root">
        <div className="feed-phone">

          {/* Top bar */}
          {/* ── Sidebar Drawer ── */}
          {drawerOpen && (
            <>
              <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
              <div className="drawer">
                {/* User info */}
                <div className="drawer-header">
                  <div className="drawer-avatar">
                    {(me?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="drawer-user-name">{me?.name || "User"}</div>
                    <div className="drawer-user-handle">@{me?.email?.split("@")[0] || "user"}</div>
                  </div>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    style={{
                      background: "rgba(255,255,255,0.08)", border: "none",
                      borderRadius: "50%", width: 32, height: 32,
                      color: "rgba(255,255,255,0.6)", fontSize: 18,
                      cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >×</button>
                </div>

                {/* Menu items */}
                <div className="drawer-menu">
                  <Link to="/profile" className="drawer-item" onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-item-icon">👤</div>
                    My Profile
                  </Link>

                  <Link to="/feed" className="drawer-item" onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-item-icon">🏠</div>
                    Home Feed
                  </Link>

                  <Link to="/messages" className="drawer-item" onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-item-icon">💬</div>
                    Messages
                  </Link>

                  <Link to="/matches" className="drawer-item" onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-item-icon">🌐</div>
                    Find Partners
                  </Link>

                  <div className="drawer-sep" />

                  <button className="drawer-item" onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-item-icon">🔔</div>
                    Notifications
                  </button>

                  <button className="drawer-item" onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-item-icon">⚙️</div>
                    Settings
                  </button>

                  <button className="drawer-item" onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-item-icon">❓</div>
                    Help & Support
                  </button>

                  <div className="drawer-sep" />

                  <button
                    className="drawer-item logout"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      navigate("/login");
                    }}
                  >
                    <div className="drawer-item-icon">🚪</div>
                    Log Out
                  </button>
                </div>

                <div className="drawer-footer">Bello! v1.0 · Language Exchange</div>
              </div>
            </>
          )}

          <div className="feed-topbar">
            <div className="feed-logo" onClick={() => setDrawerOpen(true)} style={{ cursor: "pointer" }}>
              <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <text x="7" y="15" fill="white" fontSize="9" fontWeight="800" fontFamily="Nunito">A</text>
                <rect x="19" y="14" width="18" height="14" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                <text x="23" y="24" fill="white" fontSize="8" fontWeight="800" fontFamily="Nunito">文</text>
              </svg>
            </div>

            <div className="feed-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                ref={searchRef}
                className="feed-search"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="feed-tabs">
            <button className={`feed-tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
              All Posts
            </button>
            <button className={`feed-tab ${activeTab === "following" ? "active" : ""}`} onClick={() => setActiveTab("following")}>
              Following
            </button>
          </div>

          {/* Language filter */}
          <div className="lang-filter-wrap">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                className={`lang-chip ${activeLang === lang ? "active" : ""}`}
                onClick={() => setActiveLang(lang)}
              >
                {lang !== "All" && (LANG_FLAG[lang] || "")} {lang}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="feed-loading">Loading posts...</div>
          ) : filtered.length === 0 ? (
            <div className="feed-empty">
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p>No posts found</p>
            </div>
          ) : (
            filtered.map((post, idx) => {
              const authorName = post.author?.name || "User";
              const authorHandle = "@" + (post.author?.email?.split("@")[0] || "user");
              const authorId = post.author?._id;
              const isLiked = likedPosts.has(post._id);
              const likesCount = (post.likes || 0) + (isLiked ? 1 : 0);

              return (
                <div key={post._id} className="feed-post" style={{ animationDelay: `${idx * 0.04}s` }}>

                  <div className="post-header">
                    {/* Avatar */}
                    <div
                      className="post-avatar"
                      onClick={() => navigate(authorId === me?.id ? "/profile" : `/profile/${authorId}`)}
                    >
                      {authorName.charAt(0).toUpperCase()}
                    </div>

                    <div className="post-meta">
                      {/* Name + handle */}
                      <div
                        className="post-name"
                        onClick={() => navigate(authorId === me?.id ? "/profile" : `/profile/${authorId}`)}
                      >
                        {authorName}
                      </div>
                      <div className="post-handle">{authorHandle}</div>

                      {/* Lang bar */}
                      <LangBar
                        nativeLang={post.nativeLanguage}
                        learningLangs={post.learningLanguage ? [{ language: post.learningLanguage, level: "B1" }] : []}
                      />
                    </div>

                    <span className="post-time">{timeAgo(post.createdAt)}</span>
                  </div>

                  {/* Post text */}
                  <p className="post-text">{post.text}</p>

                  {/* Topics */}
                  {post.topics?.length > 0 && (
                    <div className="post-topics">
                      {post.topics.map(t => (
                        <span key={t} className="post-topic-chip">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Likes count */}
                  <div className="post-likes-row">
                    <span>{likesCount} likes &nbsp; {post.comments?.length || 0} comments</span>
                  </div>

                  {/* Actions */}
                  <div className="post-actions">
                    <button className={`action-btn ${isLiked ? "liked" : ""}`} onClick={() => toggleLike(post._id)}>
                      <span style={{ fontSize:16 }}>{isLiked ? "❤️" : "🤍"}</span> Like
                    </button>
                    <div className="action-sep"/>
                    <button className="action-btn">
                      <span style={{ fontSize:16 }}>💬</span> Comment
                    </button>
                    <div className="action-sep"/>
                    <button className="action-btn">
                      <span style={{ fontSize:16 }}>🌐</span> Translate
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom nav */}
        <nav className="bottom-nav">
          <Link to="/feed"><button className="nav-btn active">🏠</button></Link>
          <Link to="/messages"><button className="nav-btn">💬</button></Link>
          <button className="nav-plus" onClick={() => navigate("/posts/new")}>+</button>
          <Link to="/profile"><button className="nav-btn">👤</button></Link>
          <Link to="/matches"><button className="nav-btn">📋</button></Link>
        </nav>
      </div>
    </>
  );
}