import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const LANG_FLAG = {
  English: "🇬🇧", Thai: "🇹🇭", Japanese: "🇯🇵", Korean: "🇰🇷",
  "Chinese (Mandarin)": "🇨🇳", French: "🇫🇷", German: "🇩🇪",
  Spanish: "🇪🇸", Italian: "🇮🇹", Portuguese: "🇵🇹",
  Arabic: "🇸🇦", Hindi: "🇮🇳", Russian: "🇷🇺", Vietnamese: "🇻🇳",
  Indonesian: "🇮🇩", Malay: "🇲🇾", Dutch: "🇳🇱", Swedish: "🇸🇪", Polish: "🇵🇱",
};

const LEVEL_DOTS = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 5 };

const ALL_TOPICS = ["Exercise", "Movie", "Podcast", "Book", "Food", "Music",
  "Travel", "Gaming", "Art", "Fashion", "Tech", "Sports", "Photography",
  "Cooking", "Dance", "Anime", "Reading", "Culture"];

function LangDots({ level, color = "#4a7fe0" }) {
  const filled = LEVEL_DOTS[level] || 1;
  return (
    <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: i <= filled ? color : "rgba(255,255,255,0.2)",
        }} />
      ))}
    </div>
  );
}

export default function Posts() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser]       = useState(null);
  const [text, setText]       = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showAllTopics, setShowAllTopics]   = useState(false);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile");
      setProfile(res.data.profile || res.data);
      setUser(res.data.user || me);
    } catch {
      setUser(me);
    }
  };

  const toggleTopic = (t) => {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const handlePost = async () => {
    if (!text.trim()) {
      setMessage("Please write something first.");
      return;
    }
    setPosting(true);
    try {
      await API.post("/posts", {
        text: text.trim(),
        topics: selectedTopics,
        learningLanguage: profile?.languagesLearning?.[0]?.language || "",
        nativeLanguage: profile?.nativeLanguage || "",
      });
      navigate("/profile");
    } catch (err) {
      setMessage(err.response?.data?.message || "Post failed");
    } finally {
      setPosting(false);
    }
  };

  const displayName  = user?.name || "User";
  const handle       = "@" + (user?.email?.split("@")[0] || "user");
  const avatar       = profile?.profilePicture || null;
  const nativeLang   = profile?.nativeLanguage || "";
  const learningLangs = profile?.languagesLearning || [];

  const visibleTopics = showAllTopics ? ALL_TOPICS : ALL_TOPICS.slice(0, 5);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-root {
          min-height: 100vh;
          background: #e8eef8;
          font-family: 'Nunito', sans-serif;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .cp-phone {
          width: 100%;
          max-width: 390px;
          min-height: 100vh;
          background: #e8eef8;
          position: relative;
        }

        /* Top bar */
        .cp-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px 12px;
          background: #e8eef8;
        }

        .cp-back {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #1a2d6b;
          font-family: 'Nunito', sans-serif;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .cp-post-btn {
          background: #4a7fe0;
          border: none;
          border-radius: 20px;
          padding: 9px 22px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 4px 14px rgba(74,127,224,0.4);
        }

        .cp-post-btn:hover:not(:disabled) { background: #5a8ff0; transform: translateY(-1px); }
        .cp-post-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Card */
        .cp-card {
          background: #1a2d6b;
          border-radius: 24px;
          margin: 0 16px;
          padding: 18px;
          animation: fadeUp 0.35s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* User row */
        .cp-user-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .cp-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.2);
          object-fit: cover;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
          overflow: hidden;
        }

        .cp-user-info { flex: 1; }

        .cp-name {
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 2px;
        }

        .cp-handle {
          color: rgba(255,255,255,0.45);
          font-size: 12px;
          font-weight: 600;
        }

        /* Language bar */
        .cp-lang-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .cp-lang-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cp-lang-abbr {
          color: rgba(255,255,255,0.85);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        .cp-lang-sep {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.2);
          margin: 0 4px;
        }

        .cp-arrow {
          color: rgba(255,255,255,0.45);
          font-size: 14px;
        }

        /* Textarea */
        .cp-textarea {
          width: 100%;
          background: #fff;
          border: none;
          border-radius: 16px;
          padding: 16px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #1a2d6b;
          resize: none;
          min-height: 140px;
          outline: none;
          margin-bottom: 14px;
          line-height: 1.6;
        }

        .cp-textarea::placeholder { color: #aab4cc; }

        /* Topics */
        .cp-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        .cp-chip {
          background: rgba(255,255,255,0.12);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 6px 14px;
          color: rgba(255,255,255,0.6);
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .cp-chip.selected {
          background: #4a7fe0;
          border-color: #4a7fe0;
          color: #fff;
        }

        .cp-chip:hover:not(.selected) {
          background: rgba(255,255,255,0.18);
        }

        .cp-see-more {
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 6px 14px;
          color: rgba(255,255,255,0.4);
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        /* Media buttons */
        .cp-media-row {
          display: flex;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .cp-media-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #0f1c3f;
          border: none;
          color: rgba(255,255,255,0.7);
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .cp-media-btn:hover { background: #1a2d6b; }

        /* Message */
        .cp-msg {
          text-align: center;
          color: #ff8fa3;
          font-size: 13px;
          font-weight: 700;
          margin: 12px 16px 0;
        }
      `}</style>

      <div className="cp-root">
        <div className="cp-phone">

          {/* Top bar */}
          <div className="cp-topbar">
            <button className="cp-back" onClick={() => navigate(-1)}>
              ‹ Create post
            </button>
            <button className="cp-post-btn" onClick={handlePost} disabled={posting}>
              {posting ? "Posting..." : "Post"}
            </button>
          </div>

          {/* Card */}
          <div className="cp-card">

            {/* User row */}
            <div className="cp-user-row">
              {avatar ? (
                <img className="cp-avatar" src={avatar} alt="avatar" />
              ) : (
                <div className="cp-avatar">{displayName.charAt(0).toUpperCase()}</div>
              )}

              <div className="cp-user-info">
                <div className="cp-name">{displayName}</div>
                <div className="cp-handle">{handle}</div>

                {/* Language bar */}
                <div className="cp-lang-bar">
                  {nativeLang && (
                    <div className="cp-lang-item">
                      <span style={{ fontSize: 18 }}>{LANG_FLAG[nativeLang] || "🌐"}</span>
                      <div>
                        <div className="cp-lang-abbr">
                          {nativeLang.slice(0, 2).toUpperCase()}
                        </div>
                        <LangDots level="C2" color="#4ade80" />
                      </div>
                    </div>
                  )}

                  {learningLangs.length > 0 && (
                    <>
                      <span className="cp-arrow">⇌</span>
                      {learningLangs.map((l, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {i > 0 && <div className="cp-lang-sep" />}
                          <span style={{ fontSize: 18 }}>{LANG_FLAG[l.language] || "🌐"}</span>
                          <div>
                            <div className="cp-lang-abbr">
                              {l.language.slice(0, 2).toUpperCase()}
                            </div>
                            <LangDots level={l.level} color="rgba(255,255,255,0.6)" />
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              className="cp-textarea"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
            />

            {/* Topics */}
            <div className="cp-topics">
              {visibleTopics.map((t) => (
                <button
                  key={t}
                  className={`cp-chip ${selectedTopics.includes(t) ? "selected" : ""}`}
                  onClick={() => toggleTopic(t)}
                >
                  + {t}
                </button>
              ))}
              {!showAllTopics && (
                <button className="cp-see-more" onClick={() => setShowAllTopics(true)}>
                  See more +
                </button>
              )}
            </div>

            {/* Media buttons */}
            <div className="cp-media-row">
              <button className="cp-media-btn" title="Camera">📷</button>
              <button className="cp-media-btn" title="Gallery">🖼</button>
              <button className="cp-media-btn" title="Audio">🎙</button>
            </div>

          </div>

          {message && <p className="cp-msg">{message}</p>}

        </div>
      </div>
    </>
  );
}/ /   p o s t   c r u d   f e a t u r e  
 