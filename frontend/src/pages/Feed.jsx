import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import PhoneFrame from "../components/PhoneFrame";

const LANG_FLAG = {
  English: "🇬🇧", Thai: "🇹🇭", Japanese: "🇯🇵", Korean: "🇰🇷",
  "Chinese (Mandarin)": "🇨🇳", "Chinese (Cantonese)": "🇨🇳",
  French: "🇫🇷", German: "🇩🇪", Spanish: "🇪🇸", Italian: "🇮🇹",
  Portuguese: "🇵🇹", Arabic: "🇸🇦", Hindi: "🇮🇳", Russian: "🇷🇺",
  Vietnamese: "🇻🇳", Indonesian: "🇮🇩", Malay: "🇲🇾",
  Dutch: "🇳🇱", Swedish: "🇸🇪", Polish: "🇵🇱",
};

const LANGUAGES = [
  "All", "English", "Thai", "Japanese", "Korean",
  "Chinese (Mandarin)", "French", "German", "Spanish", "Vietnamese"
];

const LEVEL_FILLED = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 5 };

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs`;
  return `${Math.floor(diff / 86400)} days`;
}

function LangDots({ filled, color = "bg-white/75" }) {
  return (
    <div className="mt-0.5 flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i <= filled ? color : "bg-white/20"}`}
        />
      ))}
    </div>
  );
}

function LangBar({ nativeLang, learningLangs = [] }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      {nativeLang && (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base leading-none">{LANG_FLAG[nativeLang] || "🌐"}</span>
          <span className="text-[10px] font-extrabold text-white/80">
            {nativeLang.slice(0, 2).toUpperCase()}
          </span>
          <LangDots filled={5} color="bg-green-400" />
        </div>
      )}

      {learningLangs.length > 0 && (
        <span className="text-xs text-white/35">⇌</span>
      )}

      {learningLangs.map((l, i) => {
        const filled = LEVEL_FILLED[l.level] || 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="inline-block h-6 w-px bg-white/15" />}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base leading-none">{LANG_FLAG[l.language] || "🌐"}</span>
              <span className="text-[10px] font-extrabold text-white/80">
                {l.language.slice(0, 2).toUpperCase()}
              </span>
              <LangDots filled={filled} />
            </div>
          </span>
        );
      })}
    </div>
  );
}

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeLang, setActiveLang] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchRef = useRef(null);
  const me = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchPosts();
    fetchFollowing();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [posts, search, activeLang, activeTab, followingIds]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/posts");
      setPosts(res.data || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async () => {
    try {
      const meRes = await API.get("/auth/me");
      setFollowingIds(new Set((meRes.data.following || []).map(String)));
    } catch {}
  };

  const applyFilters = () => {
    let result = [...posts];

    if (activeTab === "following") {
      result = result.filter((p) => followingIds.has(String(p.author?._id)));
    }

    if (activeLang !== "All") {
      result = result.filter(
        (p) => p.nativeLanguage === activeLang || p.learningLanguage === activeLang
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.text?.toLowerCase().includes(q) ||
          p.author?.name?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  };

  const toggleLike = (postId) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
        {/* Full background layer */}
        <div className="w-full px0 py-0 bg-gradient-to-br from-[#1a3575] via-[#1a2d6b] to-[#162860] min-h-full pb-24">
          {/* Drawer */}
          {drawerOpen && (
            <>
              <div
                className="fixed inset-0 z-[200] bg-black/55 backdrop-blur-sm"
                onClick={() => setDrawerOpen(false)}
              />

              <div className="fixed top-0 left-[calc(50%-195px)] z-[201] flex h-full w-[292px] flex-col bg-gradient-to-b from-[#1a3575] to-[#0f1c3f] shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 px-5 pb-6 pt-14">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f] text-xl font-extrabold text-white">
                    {(me?.name || "U").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-extrabold text-white">
                      {me?.name || "User"}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-white/40">
                      @{me?.email?.split("@")[0] || "user"}
                    </div>
                  </div>

                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-white/10 text-lg text-white/60"
                  >
                    ×
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-3">
                  {[
                    { to: "/profile", icon: "👤", label: "My Profile" },
                    { to: "/feed", icon: "🏠", label: "Home Feed" },
                    { to: "/messages", icon: "💬", label: "Messages" },
                    { to: "/matches", icon: "🌐", label: "Find Partners" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-white/75 no-underline transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                        {item.icon}
                      </div>
                      {item.label}
                    </Link>
                  ))}

                  <div className="mx-5 my-2 h-px bg-white/10" />

                  {["🔔 Notifications", "⚙️ Settings", "❓ Help & Support"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setDrawerOpen(false)}
                      className="flex w-full cursor-pointer items-center gap-3.5 border-0 bg-transparent px-5 py-3.5 text-left text-sm font-bold text-white/75 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                        {item.split(" ")[0]}
                      </div>
                      {item.split(" ").slice(1).join(" ")}
                    </button>
                  ))}

                  <div className="mx-5 my-2 h-px bg-white/10" />

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      navigate("/login");
                    }}
                    className="flex w-full cursor-pointer items-center gap-3.5 border-0 bg-transparent px-5 py-3.5 text-left text-sm font-bold text-[#ff8fa3] transition-colors hover:bg-red-500/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-lg">
                      🚪
                    </div>
                    Log Out
                  </button>
                </div>

                <div className="px-5 pb-8 text-[11px] font-semibold text-white/20">
                  Bello! v1.0 · Language Exchange
                </div>
              </div>
            </>
          )}

          {/* Centered mobile content */}
          <div className="relative mx-auto w-full max-w-[390px] min-h-screen pb-24">
            {/* Topbar */}
            <div className="sticky top-0 z-50 bg-[#0f1c3f] px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setDrawerOpen(true)}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#1a2d6b]"
                >
                  <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="3"
                      fill="rgba(255,255,255,0.15)"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="1.5"
                    />
                    <text
                      x="7"
                      y="15"
                      fill="white"
                      fontSize="9"
                      fontWeight="800"
                      fontFamily="Nunito"
                    >

                    </text>
                    <rect
                      x="19"
                      y="14"
                      width="18"
                      height="14"
                      rx="3"
                      fill="rgba(255,255,255,0.15)"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="1.5"
                    />
                    <text
                      x="23"
                      y="24"
                      fill="white"
                      fontSize="8"
                      fontWeight="800"
                      fontFamily="Nunito"
                    >
                      文
                    </text>
                  </svg>
                </div>

                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/35">
                    🔍
                  </span>
                  <input
                    ref={searchRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full rounded-full border border-white/10 bg-white/10 py-2.5 pl-9 pr-4 text-[13px] font-semibold text-white outline-none transition-all placeholder:text-white/30 focus:border-white/25 focus:bg-white/12"
                  />
                </div>
              </div>
            </div>

            {/* Feed content */}
            <div className="min-h-full w-full bg-gradient-to-br from-[#1a3575] via-[#1a2d6b] to-[#162860] px-4 py-6">
              {/* Tabs */}
              <div className="flex border-b border-white/[0.07] px-4 pt-3">
                {[
                  { val: "all", label: "All Posts" },
                  { val: "following", label: "Following" },
                ].map((tab) => (
                  <button
                    key={tab.val}
                    onClick={() => setActiveTab(tab.val)}
                    className={`relative flex-1 border-0 bg-transparent pb-3 text-[13px] font-extrabold transition-colors ${
                      activeTab === tab.val ? "text-white" : "text-white/40"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.val && (
                      <span className="absolute bottom-[-1px] left-[20%] block h-[2.5px] w-[60%] rounded-sm bg-[#4a7fe0]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Language filter */}
              <div
                className="flex gap-2 overflow-x-auto border-b border-white/[0.06] px-4 py-3"
                style={{ scrollbarWidth: "none" }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                      activeLang === lang
                        ? "border-[#4a7fe0] bg-[#4a7fe0] text-white"
                        : "border-white/10 bg-white/10 text-white/55 hover:bg-white/15"
                    }`}
                  >
                    {lang !== "All" && (LANG_FLAG[lang] || "")} {lang}
                  </button>
                ))}
              </div>

              {/* Posts */}
              {loading ? (
                <div className="flex justify-center p-10 text-sm text-white/30">
                  Loading posts...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-sm text-white/30">
                  <p className="mb-2 text-4xl">📭</p>
                  <p>No posts found</p>
                </div>
              ) : (
                filtered.map((post) => {
                  const authorName = post.author?.name || "User";
                  const authorHandle = "@" + (post.author?.email?.split("@")[0] || "user");
                  const authorId = post.author?._id;
                  const isLiked = likedPosts.has(post._id);
                  const likesCount = (post.likes || 0) + (isLiked ? 1 : 0);

                  return (
                    <div
                      key={post._id}
                      className="border-b border-white/[0.07] px-4 pt-4"
                    >
                      <div className="mb-2.5 flex items-start gap-2.5">
                        <div
                          onClick={() =>
                            navigate(authorId === me?.id ? "/profile" : `/profile/${authorId}`)
                          }
                          className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-white/15 bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f] text-lg font-extrabold text-white"
                        >
                          {authorName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div
                            onClick={() =>
                              navigate(authorId === me?.id ? "/profile" : `/profile/${authorId}`)
                            }
                            className="mb-0.5 cursor-pointer text-sm font-extrabold text-white hover:underline"
                          >
                            {authorName}
                          </div>

                          <div className="mb-1.5 text-[11px] font-semibold text-white/40">
                            {authorHandle}
                          </div>

                          <LangBar
                            nativeLang={post.nativeLanguage}
                            learningLangs={
                              post.learningLanguage
                                ? [{ language: post.learningLanguage, level: "B1" }]
                                : []
                            }
                          />
                        </div>

                        <span className="shrink-0 text-xs font-semibold text-white/35">
                          {timeAgo(post.createdAt)}
                        </span>
                      </div>

                      <p className="mb-2.5 text-sm font-semibold leading-[1.55] text-white/85">
                        {post.text}
                      </p>

                      {post.topics?.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          {post.topics.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/55"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end pb-1.5 text-xs font-bold text-white/30">
                        {likesCount} likes &nbsp; {post.comments?.length || 0} comments
                      </div>

                      <div className="-mx-4 flex border-t border-white/[0.06]">
                        {[
                          {
                            label: "Like",
                            icon: isLiked ? "❤️" : "🤍",
                            active: isLiked,
                            onClick: () => toggleLike(post._id),
                          },
                          {
                            label: "Comment",
                            icon: "💬",
                            active: false,
                            onClick: () => {},
                          },
                          {
                            label: "Translate",
                            icon: "🌐",
                            active: false,
                            onClick: () => {},
                          },
                        ].map((action, i) => (
                          <button
                            key={action.label}
                            onClick={action.onClick}
                            className={`flex flex-1 items-center justify-center gap-1.5 border-0 bg-transparent py-2.5 text-xs font-bold transition-colors ${
                              action.active
                                ? "text-red-400"
                                : "text-white/45 hover:text-white/80"
                            } ${i > 0 ? "border-l border-white/[0.06]" : ""}`}
                          >
                            <span className="text-base">{action.icon}</span>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}