import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/api";

const LEVEL_DOTS = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 5 };

const LANG_FLAG = {
  English: "🇬🇧", Thai: "🇹🇭", Japanese: "🇯🇵", Korean: "🇰🇷",
  "Chinese (Mandarin)": "🇨🇳", "Chinese (Cantonese)": "🇨🇳",
  French: "🇫🇷", German: "🇩🇪", Spanish: "🇪🇸", Italian: "🇮🇹",
  Portuguese: "🇵🇹", Arabic: "🇸🇦", Hindi: "🇮🇳", Russian: "🇷🇺",
  Vietnamese: "🇻🇳", Indonesian: "🇮🇩", Malay: "🇲🇾",
  Dutch: "🇳🇱", Swedish: "🇸🇪", Polish: "🇵🇱",
};

function LangDots({ level }) {
  const filled = LEVEL_DOTS[level] || 1;
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 7, height: 7, borderRadius: "50%",
            background: i <= filled ? "#fff" : "rgba(255,255,255,0.25)",
          }}
        />
      ))}
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile]     = useState(null);
  const [user, setUser]           = useState(null);
  const [tab, setTab]             = useState("about");
  const [posts, setPosts]         = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [message, setMessage]     = useState("");
  const [loading, setLoading]     = useState(true);
  const [menuPostId, setMenuPostId]   = useState(null);
  const [editPost, setEditPost]       = useState(null);
  const [editText, setEditText]       = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [likedPosts, setLikedPosts]   = useState(new Set());

  const me = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwn = !id || id === me?.id;

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let res;
      if (isOwn) {
        res = await API.get("/profile");
      } else {
        res = await API.get(`/profile/${id}`);
      }
      setProfile(res.data.profile || res.data);
      setUser(res.data.user || { name: me?.name, email: me?.email });
      setIsFollowing(res.data.isFollowing || false);

      try {
        if (isOwn) {
          const meRes = await API.get("/auth/me");
          setFollowersCount(meRes.data.followers?.length || 0);
          setFollowingCount(meRes.data.following?.length || 0);
        } else {
          const statusRes = await API.get(`/follow/status/${id}`);
          setIsFollowing(statusRes.data.isFollowing || false);
          setFollowersCount(res.data.followersCount || res.data.user?.followers?.length || 0);
          setFollowingCount(res.data.followingCount || res.data.user?.following?.length || 0);
        }
      } catch {
        // fallback to 0
      }
    } catch (err) {
      setMessage("Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const targetId = isOwn ? me?.id : id;
      const res = await API.get(`/posts/user/${targetId}`);
      setPosts(res.data || []);
    } catch {
      setPosts([]);
    }
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === "posts" && posts.length === 0) fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    setMenuPostId(null);
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  const openEdit = (post) => {
    setMenuPostId(null);
    setEditPost(post);
    setEditText(post.text);
  };

  const handleEditSave = async () => {
    if (!editText.trim()) return;
    setEditLoading(true);
    try {
      const res = await API.put(`/posts/${editPost._id}`, { text: editText.trim() });
      setPosts((prev) => prev.map((p) => p._id === editPost._id ? res.data : p));
      setEditPost(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "Edit failed");
    } finally {
      setEditLoading(false);
    }
  };

  const toggleLike = (postId) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60)    return `${diff}s`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)} Days`;
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await API.delete(`/follow/${id}`);
        setIsFollowing(false);
        setFollowersCount(c => Math.max(0, c - 1));
      } else {
        await API.post(`/follow/${id}`);
        setIsFollowing(true);
        setFollowersCount(c => c + 1);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Action failed");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/messages/${id}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1c3f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito, sans-serif", fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  const displayName  = user?.name || "User";
  const handle       = "@" + (user?.email?.split("@")[0] || "user");
  const avatar       = profile?.profilePicture || null;
  const city         = profile?.city || "";
  const country      = profile?.country || "";
  const nativeLang   = profile?.nativeLanguage || "";
  const learningLangs = profile?.languagesLearning || [];
  const interests    = profile?.interests || [];
  const bio          = profile?.bio || "";
  const ageRange     = profile?.ageRange || "";
  const gender       = profile?.gender || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .profile-root {
          min-height: 100vh;
          background: #0f1c3f;
          font-family: 'Nunito', sans-serif;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-bottom: 80px;
        }

        .profile-phone {
          width: 100%;
          max-width: 390px;
          min-height: 100vh;
          background: #0f1c3f;
          position: relative;
          overflow: hidden;
        }

        .map-header {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #1a3575;
        }

        .map-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.7;
          filter: saturate(0.8) brightness(0.9);
        }

        .map-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1a3575 0%, #2a4a8f 50%, #162860 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .back-btn {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(15, 28, 63, 0.8);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          backdrop-filter: blur(8px);
        }

        .edit-btn-top {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(15,28,63,0.8);
          border: none;
          border-radius: 20px;
          padding: 6px 14px;
          color: rgba(255,255,255,0.8);
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          z-index: 10;
          backdrop-filter: blur(8px);
        }

        .profile-card {
          background: linear-gradient(180deg, #1a2d6b 0%, #0f1c3f 100%);
          border-radius: 28px 28px 0 0;
          margin-top: -28px;
          position: relative;
          padding: 0 20px 20px;
          animation: fadeUp 0.4s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .avatar-wrap {
          display: flex;
          justify-content: center;
          margin-top: -44px;
          margin-bottom: 12px;
        }

        .avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          border: 4px solid #1a2d6b;
          object-fit: cover;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: white;
          font-weight: 800;
          overflow: hidden;
        }

        .stats-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat { text-align: center; flex: 1; }
        .stat-num { color: #fff; font-size: 20px; font-weight: 900; }
        .stat-label { color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600; }

        .name-center { flex: 2; text-align: center; }
        .display-name { color: #fff; font-size: 22px; font-weight: 900; letter-spacing: -0.3px; }
        .handle { color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 600; }

        .profile-bio {
          text-align: center;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
          margin: 10px 0 16px;
          padding: 0 8px;
        }

        .lang-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .lang-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .lang-flag { font-size: 28px; }
        .lang-name { color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 700; }
        .lang-arrow { color: rgba(255,255,255,0.4); font-size: 18px; margin-bottom: 12px; }

        .action-row { display: flex; gap: 12px; margin-bottom: 24px; }

        .btn-follow {
          flex: 1;
          background: #4a7fe0;
          border: none;
          border-radius: 24px;
          padding: 13px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(74,127,224,0.4);
        }

        .btn-follow:hover:not(:disabled) { background: #5a8ff0; transform: translateY(-1px); }
        .btn-follow.following { background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.2); }
        .btn-follow:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-message {
          flex: 1;
          background: #fff;
          border: none;
          border-radius: 24px;
          padding: 13px;
          color: #0f1c3f;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }

        .btn-message:hover { background: #f0f4ff; transform: translateY(-1px); }

        .tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 20px;
        }

        .tab-btn {
          flex: 1;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 800;
          padding: 10px 0 12px;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }

        .tab-btn.active { color: #fff; }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 20%;
          width: 60%;
          height: 2.5px;
          border-radius: 2px;
          background: #4a7fe0;
        }

        .section-title { color: #fff; font-size: 15px; font-weight: 900; margin-bottom: 12px; }

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          color: rgba(255,255,255,0.75);
          font-size: 14px;
          font-weight: 600;
        }

        .info-icon { font-size: 18px; flex-shrink: 0; }

        .divider-line { height: 1px; background: rgba(255,255,255,0.08); margin: 20px 0; }

        .chips-wrap { display: flex; flex-wrap: wrap; gap: 8px; }

        .chip {
          background: rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 6px 14px;
          color: rgba(255,255,255,0.7);
          font-size: 12px;
          font-weight: 700;
        }

        .post-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0 6px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 2px;
        }

        .post-stats-left  { color: rgba(255,255,255,0.45); font-size: 12px; font-weight: 700; }
        .post-stats-right { color: rgba(255,255,255,0.45); font-size: 12px; font-weight: 700; }

        .post-card {
          background: transparent;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding: 14px 0 4px;
        }

        .post-card:last-child { border-bottom: none; }

        .post-author-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }

        .post-author-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; font-weight: 800; color: white;
          flex-shrink: 0; overflow: hidden;
          border: 2px solid rgba(255,255,255,0.15);
        }

        .post-author-info { flex: 1; }
        .post-author-name { color: #fff; font-size: 14px; font-weight: 800; margin-bottom: 2px; }
        .post-author-handle { color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 600; }

        .post-time-menu { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .post-time { color: rgba(255,255,255,0.35); font-size: 12px; font-weight: 600; }

        .post-menu-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.4);
          font-size: 20px; cursor: pointer;
          padding: 0 2px; line-height: 1;
        }

        .post-content {
          color: rgba(255,255,255,0.85);
          font-size: 14px; font-weight: 600;
          line-height: 1.55; margin-bottom: 12px;
        }

        .post-action-row {
          display: flex; align-items: center; gap: 0;
          padding: 8px 0 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .post-action-btn {
          flex: 1; display: flex; align-items: center;
          justify-content: center; gap: 6px;
          background: none; border: none;
          color: rgba(255,255,255,0.5);
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 700;
          cursor: pointer; padding: 6px 0;
          transition: color 0.2s;
        }

        .post-action-btn:hover { color: rgba(255,255,255,0.85); }
        .post-action-btn.liked { color: #f87171; }

        .post-action-sep { width: 1px; height: 16px; background: rgba(255,255,255,0.1); }

        .post-likes-row {
          display: flex; justify-content: flex-end;
          color: rgba(255,255,255,0.35);
          font-size: 12px; font-weight: 700;
          margin-bottom: 6px;
        }

        .empty-state {
          text-align: center;
          color: rgba(255,255,255,0.3);
          font-size: 14px; font-weight: 600;
          padding: 32px 0;
        }

        .bottom-nav {
          position: fixed; bottom: 0;
          left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 390px;
          background: linear-gradient(180deg, rgba(15,28,63,0) 0%, rgba(10,20,50,0.97) 40%);
          padding: 8px 0 16px;
          display: flex; align-items: center; justify-content: space-around;
          z-index: 100;
        }

        .nav-btn {
          background: none; border: none;
          color: rgba(255,255,255,0.4);
          font-size: 22px; cursor: pointer;
          padding: 8px 12px; transition: color 0.2s;
          display: flex; align-items: center; justify-content: center;
        }

        .nav-btn:hover { color: rgba(255,255,255,0.8); }
        .nav-btn.active { color: #fff; }

        .nav-plus {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: #4a7fe0; border: none;
          color: white; font-size: 26px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(74,127,224,0.5);
          transition: transform 0.15s; margin-bottom: 4px;
        }

        .nav-plus:hover { transform: scale(1.08); }

        .toast {
          position: fixed; top: 20px;
          left: 50%; transform: translateX(-50%);
          background: rgba(255,80,80,0.9);
          color: white; padding: 10px 20px;
          border-radius: 20px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 700;
          z-index: 999; backdrop-filter: blur(10px);
        }
      `}</style>

      <div className="profile-root">
        <div className="profile-phone">

          {/* Map header */}
          <div className="map-header">
            {city && country ? (
              <img
                className="map-img"
                src={`https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(city + "," + country)}&zoom=13&size=400x200&maptype=mapnik`}
                alt="map"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            ) : (
              <div className="map-fallback">
                <span style={{ fontSize: 48, opacity: 0.2 }}>🗺️</span>
              </div>
            )}

            <button className="back-btn" onClick={() => navigate(-1)}>←</button>

            {isOwn && (
              <Link to="/profile/edit">
                <button className="edit-btn-top">Edit Profile</button>
              </Link>
            )}
          </div>

          {/* Profile card */}
          <div className="profile-card">

            {/* Avatar */}
            <div className="avatar-wrap">
              {avatar ? (
                <img className="avatar" src={avatar} alt="avatar" />
              ) : (
                <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
              )}
            </div>

            {/* Stats + Name */}
            <div className="stats-row">
              <div className="stat">
                <div className="stat-num">{followersCount}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="name-center">
                <div className="display-name">{displayName}</div>
                <div className="handle">{handle}</div>
              </div>
              <div className="stat">
                <div className="stat-num">{followingCount}</div>
                <div className="stat-label">Following</div>
              </div>
            </div>

            {bio && <p className="profile-bio">{bio}</p>}

            {/* Language flags */}
            <div className="lang-row">
              {nativeLang && (
                <div className="lang-item">
                  <span className="lang-flag">{LANG_FLAG[nativeLang] || "🌐"}</span>
                  <span className="lang-name">{nativeLang}</span>
                  <LangDots level="C2" />
                </div>
              )}

              {learningLangs.length > 0 && (
                <span className="lang-arrow">⇌</span>
              )}

              {learningLangs.map((l, i) => (
                <div key={i} className="lang-item">
                  <span className="lang-flag">{LANG_FLAG[l.language] || "🌐"}</span>
                  <span className="lang-name">{l.language}</span>
                  <LangDots level={l.level} />
                </div>
              ))}
            </div>

            {/* Action buttons */}
            {!isOwn && (
              <div className="action-row">
                <button
                  className={`btn-follow ${isFollowing ? "following" : ""}`}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
                <button className="btn-message" onClick={handleMessage}>
                  Message
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="tabs">
              <button className={`tab-btn ${tab === "about" ? "active" : ""}`} onClick={() => handleTabChange("about")}>
                About me
              </button>
              <button className={`tab-btn ${tab === "posts" ? "active" : ""}`} onClick={() => handleTabChange("posts")}>
                My Post
              </button>
            </div>

            {/* About tab */}
            {tab === "about" && (
              <div>
                <p className="section-title">Personal Info</p>
                {(gender || ageRange) && (
                  <div className="info-row">
                    <span className="info-icon">🔍</span>
                    <span>{[gender, ageRange].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {(city || country) && (
                  <div className="info-row">
                    <span className="info-icon">📍</span>
                    <span>{[city, country].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                {interests.length > 0 && (
                  <>
                    <div className="divider-line" />
                    <p className="section-title">Personal Interest</p>
                    <div className="chips-wrap">
                      {interests.map((item) => (
                        <span key={item} className="chip">{item}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Posts tab */}
            {tab === "posts" && (
              <div>
                {posts.length > 0 && (
                  <div className="post-stats-bar">
                    <span className="post-stats-left">{posts.length} Posts</span>
                    <span className="post-stats-right">
                      {posts.reduce((s, p) => s + (p.likes || 0), 0)} Likes &nbsp;
                      {posts.reduce((s, p) => s + (p.comments?.length || 0), 0)} Comments
                    </span>
                  </div>
                )}

                {posts.length === 0 ? (
                  <div className="empty-state">
                    <p style={{ fontSize: 32, marginBottom: 8 }}>✍️</p>
                    <p>No posts yet</p>
                    {isOwn && (
                      <button onClick={() => navigate("/posts/new")} style={{
                        marginTop: 14, background: "#4a7fe0", border: "none",
                        borderRadius: 20, padding: "9px 22px", color: "#fff",
                        fontFamily: "Nunito, sans-serif", fontSize: 13,
                        fontWeight: 800, cursor: "pointer",
                      }}>
                        + Create first post
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {posts.map((post) => (
                      <div key={post._id} className="post-card" style={{ position: "relative" }}>

                        <div className="post-author-row">
                          {profile?.profilePicture ? (
                            <img className="post-author-avatar" src={profile.profilePicture} alt=""
                              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div className="post-author-avatar">{displayName.charAt(0)}</div>
                          )}

                          <div className="post-author-info">
                            <div className="post-author-name">{displayName}</div>
                            <div className="post-author-handle">{handle}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
                              {nativeLang && (
                                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                                  <span style={{ fontSize:18 }}>{LANG_FLAG[nativeLang] || "🌐"}</span>
                                  <span style={{ color:"rgba(255,255,255,0.8)", fontSize:11, fontWeight:800 }}>{nativeLang.slice(0,2).toUpperCase()}</span>
                                  <div style={{ display:"flex", gap:2 }}>
                                    {[1,2,3,4,5].map(i=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80" }}/>)}
                                  </div>
                                </div>
                              )}
                              {learningLangs.length > 0 && (
                                <span style={{ color:"rgba(255,255,255,0.4)", fontSize:14 }}>⇌</span>
                              )}
                              {learningLangs.map((l, i) => {
                                const filled = { A1:1,A2:2,B1:3,B2:4,C1:5,C2:5 }[l.level] || 1;
                                return (
                                  <span key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                                    {i > 0 && <span style={{ width:1, height:28, background:"rgba(255,255,255,0.15)", display:"inline-block" }}/>}
                                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                                      <span style={{ fontSize:18 }}>{LANG_FLAG[l.language] || "🌐"}</span>
                                      <span style={{ color:"rgba(255,255,255,0.8)", fontSize:11, fontWeight:800 }}>{l.language.slice(0,2).toUpperCase()}</span>
                                      <div style={{ display:"flex", gap:2 }}>
                                        {[1,2,3,4,5].map(d=><div key={d} style={{ width:6, height:6, borderRadius:"50%", background: d<=filled ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.18)" }}/>)}
                                      </div>
                                    </div>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <div className="post-time-menu">
                            <span className="post-time">{timeAgo(post.createdAt)}</span>
                            {isOwn && (
                              <button className="post-menu-btn"
                                onClick={() => setMenuPostId(menuPostId === post._id ? null : post._id)}>
                                ⋮
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 3-dot dropdown */}
                        {menuPostId === post._id && (
                          <div style={{
                            position: "absolute", top: 52, right: 0, zIndex: 50,
                            background: "#1a3575", borderRadius: 14,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            overflow: "hidden", minWidth: 140,
                          }}>
                            <button onClick={() => openEdit(post)} style={{
                              width:"100%", background:"none", border:"none", color:"#fff",
                              fontFamily:"Nunito,sans-serif", fontSize:14, fontWeight:700,
                              padding:"12px 16px", textAlign:"left", cursor:"pointer",
                              display:"flex", alignItems:"center", gap:10,
                            }}
                              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}
                              onMouseLeave={e=>e.currentTarget.style.background="none"}
                            >✏️ Edit</button>
                            <div style={{ height:1, background:"rgba(255,255,255,0.08)" }}/>
                            <button onClick={() => handleDeletePost(post._id)} style={{
                              width:"100%", background:"none", border:"none", color:"#ff8fa3",
                              fontFamily:"Nunito,sans-serif", fontSize:14, fontWeight:700,
                              padding:"12px 16px", textAlign:"left", cursor:"pointer",
                              display:"flex", alignItems:"center", gap:10,
                            }}
                              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,100,100,0.1)"}
                              onMouseLeave={e=>e.currentTarget.style.background="none"}
                            >🗑️ Delete</button>
                          </div>
                        )}

                        <p className="post-content">{post.text}</p>

                        {post.topics?.length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                            {post.topics.map(t=>(
                              <span key={t} style={{
                                background:"rgba(74,127,224,0.15)", border:"1px solid rgba(74,127,224,0.3)",
                                borderRadius:12, padding:"3px 10px", color:"rgba(255,255,255,0.55)",
                                fontSize:11, fontWeight:700,
                              }}>{t}</span>
                            ))}
                          </div>
                        )}

                        <div className="post-likes-row">
                          <span>{(post.likes || 0) + (likedPosts.has(post._id) ? 1 : 0)} Likes &nbsp; {post.comments?.length || 0} comments</span>
                        </div>

                        <div className="post-action-row">
                          <button
                            className={`post-action-btn ${likedPosts.has(post._id) ? "liked" : ""}`}
                            onClick={() => toggleLike(post._id)}
                          >
                            <span style={{ fontSize:16 }}>{likedPosts.has(post._id) ? "❤️" : "🤍"}</span>
                            Like
                          </button>
                          <div className="post-action-sep"/>
                          <button className="post-action-btn">
                            <span style={{ fontSize:16 }}>💬</span>
                            Comment
                          </button>
                          <div className="post-action-sep"/>
                          <button className="post-action-btn">
                            <span style={{ fontSize:16 }}>🌐</span>
                            Translate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {menuPostId && (
              <div onClick={() => setMenuPostId(null)}
                style={{ position:"fixed", inset:0, zIndex:40 }}/>
            )}
          </div>

          {/* Edit modal */}
          {editPost && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
            }}
              onClick={(e) => { if (e.target === e.currentTarget) setEditPost(null); }}
            >
              <div style={{
                background: "linear-gradient(160deg, #1a3575 0%, #162860 100%)",
                borderRadius: "24px 24px 0 0",
                padding: "24px 20px 36px",
                width: "100%", maxWidth: 390,
                boxShadow: "0 -8px 32px rgba(0,0,0,0.4)",
                animation: "fadeUp 0.25s ease both",
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <span style={{ color:"#fff", fontFamily:"Nunito, sans-serif", fontSize:16, fontWeight:800 }}>
                    Edit Post
                  </span>
                  <button onClick={() => setEditPost(null)} style={{
                    background:"none", border:"none", color:"rgba(255,255,255,0.45)",
                    fontSize:22, cursor:"pointer", lineHeight:1,
                  }}>×</button>
                </div>

                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  maxLength={1000}
                  style={{
                    width:"100%", background:"rgba(255,255,255,0.1)",
                    border:"1.5px solid rgba(255,255,255,0.15)", borderRadius:16,
                    padding:14, color:"#fff", fontFamily:"Nunito, sans-serif",
                    fontSize:14, fontWeight:600, resize:"none", minHeight:120,
                    outline:"none", boxSizing:"border-box", lineHeight:1.6,
                  }}
                />
                <div style={{ display:"flex", gap:10, marginTop:14 }}>
                  <button onClick={() => setEditPost(null)} style={{
                    flex:1, background:"rgba(255,255,255,0.1)", border:"1.5px solid rgba(255,255,255,0.15)",
                    borderRadius:14, padding:13, color:"rgba(255,255,255,0.7)",
                    fontFamily:"Nunito, sans-serif", fontSize:14, fontWeight:800, cursor:"pointer",
                  }}>
                    Cancel
                  </button>
                  <button onClick={handleEditSave} disabled={editLoading} style={{
                    flex:2, background:"#4a7fe0", border:"none", borderRadius:14,
                    padding:13, color:"#fff", fontFamily:"Nunito, sans-serif",
                    fontSize:14, fontWeight:800, cursor:"pointer",
                    opacity: editLoading ? 0.7 : 1,
                  }}>
                    {editLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom navigation */}
          <nav className="bottom-nav">
            <Link to="/feed">
              <button className="nav-btn">🏠</button>
            </Link>
            <Link to="/messages">
              <button className="nav-btn">💬</button>
            </Link>
            <button className="nav-plus" onClick={() => navigate("/posts/new")}>+</button>
            <Link to="/profile">
              <button className={`nav-btn ${isOwn ? "active" : ""}`}>👤</button>
            </Link>
            <Link to="/matches">
              <button className="nav-btn">📋</button>
            </Link>
          </nav>

        </div>

        {message && <div className="toast">{message}</div>}
      </div>
    </>
  );
}