import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import PhoneFrame from "../components/PhoneFrame";
import { getAvatarUrl } from "../utils/avatarUrl";

const avatarUrl = getAvatarUrl(user.profilePicture, user._id, user.gender);

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

function LangDots({ level, color = "bg-[#4a7fe0]" }) {
  const filled = LEVEL_DOTS[level] || 1;
  return (
    <div className="flex gap-0.5 mt-0.5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= filled ? color : "bg-white/20"}`} />
      ))}
    </div>
  );
}

export default function Posts() {
  const navigate = useNavigate();
  const [profile, setProfile]             = useState(null);
  const [user, setUser]                   = useState(null);
  const [text, setText]                   = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [showAllTopics, setShowAllTopics]   = useState(false);
  const [posting, setPosting]             = useState(false);
  const [message, setMessage]             = useState("");

  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile");
      setProfile(res.data.profile || res.data);
      setUser(res.data.user || me);
    } catch { setUser(me); }
  };

  const toggleTopic = (t) =>
    setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handlePost = async () => {
    if (!text.trim()) { setMessage("Please write something first."); return; }
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
    } finally { setPosting(false); }
  };

  const displayName   = user?.name || "User";
  const handle        = "@" + (user?.email?.split("@")[0] || "user");
  const avatar        = profile?.profilePicture || null;
  const nativeLang    = profile?.nativeLanguage || "";
  const learningLangs = profile?.languagesLearning || [];
  const visibleTopics = showAllTopics ? ALL_TOPICS : ALL_TOPICS.slice(0, 5);

  return (

    <PhoneFrame>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full px-4 py-8 bg-gradient-to-br from-[#e8eef8] via-[#e8eef8] to-[#e8eef8] ,inset_0_1px_0_#e8eef8]">


          <div className="w-full max-w-[390px] min-h-screen bg-[#e8eef8] relative">

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#e8eef8]">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 bg-transparent border-0 text-[#1a2d6b] text-base font-bold cursor-pointer">
                ‹ Create post
              </button>
              <button onClick={handlePost} disabled={posting}
                className="bg-[#4a7fe0] border-0 rounded-full px-5 py-2.5 text-white text-sm font-extrabold cursor-pointer
                  shadow-[0_4px_14px_rgba(74,127,224,0.4)] hover:bg-[#5a8ff0] hover:-translate-y-px
                  disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                {posting ? "Posting..." : "Post"}
              </button>
            </div>

            {/* Card */}
            <div className="mx-4 bg-[#1a2d6b] rounded-3xl p-[18px] animate-[fadeUp_0.35s_ease_both]">

              {/* User row */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                {avatar ? (
                  <img src={avatar} alt="avatar"
                    className="w-[52px] h-[52px] rounded-full border-[3px] border-white/20 object-cover shrink-0" />
                ) : (
                  <div className="w-[52px] h-[52px] rounded-full border-[3px] border-white/20 bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f]
                    flex items-center justify-center text-xl font-extrabold text-white shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <div className="text-white text-[15px] font-extrabold mb-0.5">{displayName}</div>
                  <div className="text-white/45 text-xs font-semibold mb-2">{handle}</div>

                  {/* Language bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {nativeLang && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{LANG_FLAG[nativeLang] || "🌐"}</span>
                        <div>
                          <div className="text-white/85 text-xs font-extrabold tracking-wide">{nativeLang.slice(0,2).toUpperCase()}</div>
                          <LangDots level="C2" color="bg-green-400" />
                        </div>
                      </div>
                    )}
                    {learningLangs.length > 0 && (
                      <>
                        <span className="text-white/45 text-sm">⇌</span>
                        {learningLangs.map((l, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            {i > 0 && <div className="w-px h-7 bg-white/20 mx-1" />}
                            <span className="text-lg">{LANG_FLAG[l.language] || "🌐"}</span>
                            <div>
                              <div className="text-white/85 text-xs font-extrabold tracking-wide">{l.language.slice(0,2).toUpperCase()}</div>
                              <LangDots level={l.level} color="bg-white/60" />
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
                placeholder="What's on your mind?"
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={500}
                className="w-full bg-white border-0 rounded-2xl p-4 text-[#1a2d6b] text-sm font-semibold
                  resize-none min-h-[140px] outline-none mb-3.5 leading-relaxed placeholder:text-[#aab4cc]"
              />

              {/* Topics */}
              <div className="flex flex-wrap gap-2 mb-3.5">
                {visibleTopics.map(t => (
                  <button key={t} onClick={() => toggleTopic(t)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold border cursor-pointer whitespace-nowrap transition-all
                      ${selectedTopics.includes(t)
                        ? "bg-[#4a7fe0] border-[#4a7fe0] text-white"
                        : "bg-white/12 border-white/15 text-white/60 hover:bg-white/18"
                      }`}>
                    + {t}
                  </button>
                ))}
                {!showAllTopics && (
                  <button onClick={() => setShowAllTopics(true)}
                    className="bg-white/8 border border-white/12 rounded-full px-3.5 py-1.5 text-white/40 text-xs font-bold cursor-pointer whitespace-nowrap">
                    See more +
                  </button>
                )}
              </div>

              {/* Media buttons */}
              <div className="flex gap-2.5 pt-3 border-t border-white/10">
                {["📷","🖼","🎙"].map((icon, i) => (
                  <button key={i}
                    className="w-[38px] h-[38px] rounded-full bg-[#0f1c3f] border-0 text-white/70 text-base cursor-pointer
                      flex items-center justify-center hover:bg-[#1a2d6b] transition-colors">
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {message && (
              <p className="text-center text-[#ff8fa3] text-[13px] font-bold mt-3 mx-4">{message}</p>
            )}

          </div>
          </div>
        </div>

      <BottomNav />
    </PhoneFrame>
  );
}