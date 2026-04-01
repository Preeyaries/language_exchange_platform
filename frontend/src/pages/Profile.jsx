import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import PhoneFrame from "../components/PhoneFrame";

const LEVEL_DOTS = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:5 };

const LANG_FLAG = {
  English:"🇬🇧", Thai:"🇹🇭", Japanese:"🇯🇵", Korean:"🇰🇷",
  "Chinese (Mandarin)":"🇨🇳","Chinese (Cantonese)":"🇨🇳",
  French:"🇫🇷", German:"🇩🇪", Spanish:"🇪🇸", Italian:"🇮🇹",
  Portuguese:"🇵🇹", Arabic:"🇸🇦", Hindi:"🇮🇳", Russian:"🇷🇺",
  Vietnamese:"🇻🇳", Indonesian:"🇮🇩", Malay:"🇲🇾",
  Dutch:"🇳🇱", Swedish:"🇸🇪", Polish:"🇵🇱",
};

function LangDots({ level, green = false }) {
  const filled = LEVEL_DOTS[level] || 1;
  return (
    <div className="flex gap-0.5 mt-1">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-[7px] h-[7px] rounded-full ${i <= filled ? (green ? "bg-green-400" : "bg-white") : "bg-white/25"}`} />
      ))}
    </div>
  );
}

function LangItem({ lang, level, green = false }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[28px]">{LANG_FLAG[lang] || "🌐"}</span>
      <span className="text-white/70 text-[11px] font-bold">{lang}</span>
      <LangDots level={level} green={green} />
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile]           = useState(null);
  const [user, setUser]                 = useState(null);
  const [tab, setTab]                   = useState("about");
  const [posts, setPosts]               = useState([]);
  const [isFollowing, setIsFollowing]   = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [message, setMessage]           = useState("");
  const [loading, setLoading]           = useState(true);
  const [menuPostId, setMenuPostId]     = useState(null);
  const [editPost, setEditPost]         = useState(null);
  const [editText, setEditText]         = useState("");
  const [editLoading, setEditLoading]   = useState(false);
  const [likedPosts, setLikedPosts]     = useState(new Set());

  const me    = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwn = !id || id === me?.id;

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = isOwn ? await API.get("/profile") : await API.get(`/profile/${id}`);
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
          setFollowersCount(res.data.followersCount || 0);
          setFollowingCount(res.data.followingCount || 0);
        }
      } catch {}
    } catch { setMessage("Could not load profile."); }
    finally { setLoading(false); }
  };

  const fetchPosts = async () => {
    try {
      const res = await API.get(`/posts/user/${isOwn ? me?.id : id}`);
      setPosts(res.data || []);
    } catch { setPosts([]); }
  };

  const handleTabChange = (t) => { setTab(t); if (t === "posts" && posts.length === 0) fetchPosts(); };

  const handleDeletePost = async (postId) => {
    setMenuPostId(null);
    try { await API.delete(`/posts/${postId}`); setPosts(prev => prev.filter(p => p._id !== postId)); }
    catch (err) { setMessage(err.response?.data?.message || "Delete failed"); }
  };

  const openEdit = (post) => { setMenuPostId(null); setEditPost(post); setEditText(post.text); };

  const handleEditSave = async () => {
    if (!editText.trim()) return;
    setEditLoading(true);
    try {
      const res = await API.put(`/posts/${editPost._id}`, { text: editText.trim() });
      setPosts(prev => prev.map(p => p._id === editPost._id ? res.data : p));
      setEditPost(null);
    } catch (err) { setMessage(err.response?.data?.message || "Edit failed"); }
    finally { setEditLoading(false); }
  };

  const toggleLike = (postId) => setLikedPosts(prev => { const n = new Set(prev); n.has(postId) ? n.delete(postId) : n.add(postId); return n; });

  const timeAgo = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 1000);
    if (d < 60) return `${d}s`; if (d < 3600) return `${Math.floor(d/60)}m`;
    if (d < 86400) return `${Math.floor(d/3600)}h`; return `${Math.floor(d/86400)} Days`;
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) { await API.delete(`/follow/${id}`); setIsFollowing(false); setFollowersCount(c => Math.max(0, c-1)); }
      else             { await API.post(`/follow/${id}`);   setIsFollowing(true);  setFollowersCount(c => c+1); }
    } catch (err) { setMessage(err.response?.data?.message || "Action failed"); }
    finally { setFollowLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f1c3f] flex items-center justify-center">
      <div className="text-white/50 text-base" style={{ fontFamily:"Nunito,sans-serif" }}>Loading...</div>
    </div>
  );

  const displayName   = user?.name || "User";
  const handle        = "@" + (user?.email?.split("@")[0] || "user");
  const avatar        = profile?.profilePicture || null;
  const city          = profile?.city || "";
  const country       = profile?.country || "";
  const nativeLang    = profile?.nativeLanguage || "";
  const learningLangs = profile?.languagesLearning || [];
  const interests     = profile?.interests || [];
  const bio           = profile?.bio || "";
  const ageRange      = profile?.ageRange || "";
  const gender        = profile?.gender || "";

  return (
      <PhoneFrame>
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          

{/* Map header */}
<div className="relative h-[200px] overflow-hidden bg-[#1a3575]">

  {city && country ? (
    <>
      {/* map image */}
      <img
        src="/map-placeholder.png"
        alt="map"
        className="w-full h-full object-cover"
      />

      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1c3f] via-[#0f1c3f]/40 to-transparent" />

      {/* location text */}
      <div className="absolute bottom-12 right-4 text-white text-sm font-bold "> {country}</div>
    </>
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-[#1a3575] via-[#2a4a8f] to-[#162860] flex items-center justify-center">
      <span className="text-5xl opacity-20">🗺️</span>
    </div>
  )}

  {/* back button */}
  <button
    onClick={() => navigate(-1)}
    className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[rgba(15,28,63,0.8)] border-0 text-white text-lg cursor-pointer flex items-center justify-center z-20 backdrop-blur-md"
  >
    ←
  </button>

  {/* edit button */}
  {isOwn && (
    <Link to="/profile/edit">
      <button className="absolute top-4 right-4 bg-[rgba(15,28,63,0.8)] border-0 rounded-2xl px-3.5 py-1.5 text-white/80 text-xs font-bold cursor-pointer z-20 backdrop-blur-md">
        Edit Profile
      </button>
    </Link>
  )}
</div>

                  {/* Profile card */}
                  <div className="bg-gradient-to-b from-[#1a2d6b] to-[#0f1c3f] rounded-t-[28px] -mt-7 relative px-8 pb-24 animate-[fadeUp_0.4s_ease_both] min-h-screen">
                    {/* Avatar */}
                    <div className="flex justify-center -mt-11 mb-3">
                      {avatar ? (
                        <img src={avatar} alt="avatar"
                          className="w-[88px] h-[88px] rounded-full border-4 border-[#1a2d6b] object-cover bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f]" />
                      ) : (
                  <div className="w-[110px] h-[110px] -mt-14 rounded-full border-6 border-white bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f] flex items-center justify-center text-[44px] text-white font-extrabold shadow-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                      )}
                    </div>

                    {/* Stats + Name */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 text-center">
                        <div className="text-white text-xl font-black">{followersCount}</div>
                        <div className="text-white/50 text-xs font-semibold">Followers</div>
                      </div>
                      <div className="flex-[2] text-center">
                        <div className="text-white text-[22px] font-black tracking-tight">{displayName}</div>
                        <div className="text-white/45 text-[13px] font-semibold">{handle}</div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-white text-xl font-black">{followingCount}</div>
                        <div className="text-white/50 text-xs font-semibold">Following</div>
                      </div>
                    </div>

                    {/* Bio */}
                    {bio && <p className="text-center text-white/70 text-[13px] font-semibold leading-snug mt-2.5 mb-4 px-2">{bio}</p>}

                    {/* Language flags */}
                    <div className="flex items-center justify-center gap-4 mb-5 flex-wrap">
                      {nativeLang && <LangItem lang={nativeLang} level="C2" green />}
                      {learningLangs.length > 0 && <span className="text-white/40 text-lg mb-3">⇌</span>}
                      {learningLangs.map((l, i) => <LangItem key={i} lang={l.language} level={l.level} />)}
                    </div>

                    {/* Follow / Message */}
                    {!isOwn && (
                      <div className="flex gap-3 mb-6">
                        <button onClick={handleFollow} disabled={followLoading}
                          className={`flex-1 border-0 rounded-3xl py-3.5 text-white text-[15px] font-extrabold cursor-pointer transition-all
                            ${isFollowing ? "bg-white/10 border border-white/20" : "bg-[#4a7fe0] shadow-[0_4px_16px_rgba(74,127,224,0.4)] hover:bg-[#5a8ff0]"}
                            disabled:opacity-60 disabled:cursor-not-allowed`}>
                          {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                        </button>
                        <button onClick={() => navigate(`/messages/${id}`)}
                          className="flex-1 bg-white border-0 rounded-3xl py-3.5 text-[#0f1c3f] text-[15px] font-extrabold cursor-pointer hover:bg-[#f0f4ff] hover:-translate-y-px transition-all">
                          Message
                        </button>
                      </div>
                    )}

                    {/* Tabs */}
                    <div className="flex border-b border-white/10 mb-5">
                      {["about","posts"].map(t => (
                        <button key={t} onClick={() => handleTabChange(t)}
                          className={`flex-1 pb-3 pt-2.5 text-sm font-extrabold bg-transparent border-0 cursor-pointer relative transition-colors
                            ${tab === t ? "text-white" : "text-white/40"}`}>
                          {t === "about" ? "About me" : "My Post"}
                          {tab === t && <span className="absolute bottom-[-1px] left-[20%] w-[60%] h-[2.5px] rounded-sm bg-[#4a7fe0] block" />}
                        </button>
                      ))}
                    </div>

                    {/* About tab */}
                    {tab === "about" && (
                      <div>
                        <p className="text-white text-[15px] font-black mb-3">Personal Info</p>
                        {(gender || ageRange) && (
                          <div className="flex items-center gap-3 mb-2.5 text-white/75 text-sm font-semibold">
                            <span className="text-lg shrink-0">🔍</span>
                            <span>{[gender, ageRange].filter(Boolean).join(", ")}</span>
                          </div>
                        )}
                        {(city || country) && (
                          <div className="flex items-center gap-3 mb-2.5 text-white/75 text-sm font-semibold">
                            <span className="text-lg shrink-0">📍</span>
                            <span>{[city, country].filter(Boolean).join(", ")}</span>
                          </div>
                        )}
                        {interests.length > 0 && (
                          <>
                            <div className="h-px bg-white/10 my-5" />
                            <p className="text-white text-[15px] font-black mb-3">Personal Interest</p>
                            <div className="flex flex-wrap gap-2">
                              {interests.map(item => (
                                <span key={item} className="bg-white/10 rounded-full px-3.5 py-1.5 text-white/70 text-xs font-bold">{item}</span>
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
                          <div className="flex justify-between py-2.5 border-b border-white/[0.07] mb-0.5">
                            <span className="text-white/45 text-xs font-bold">{posts.length} Posts</span>
                            <span className="text-white/45 text-xs font-bold">
                              {posts.reduce((s,p) => s+(p.likes||0), 0)} Likes &nbsp;
                              {posts.reduce((s,p) => s+(p.comments?.length||0), 0)} Comments
                            </span>
                          </div>
                        )}

                        {posts.length === 0 ? (
                          <div className="text-center py-8 text-white/30 text-sm font-semibold">
                            <p className="text-4xl mb-2">✍️</p>
                            <p>No posts yet</p>
                            {isOwn && (
                              <button onClick={() => navigate("/posts/new")}
                                className="mt-3.5 bg-[#4a7fe0] border-0 rounded-full px-5 py-2.5 text-white text-[13px] font-extrabold cursor-pointer">
                                + Create first post
                              </button>
                            )}
                          </div>
                        ) : posts.map(post => (
                          <div key={post._id} className="border-b border-white/[0.07] py-3.5 last:border-0 relative">
                            {/* Author row */}
                            <div className="flex items-center gap-2.5 mb-2.5">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f] flex items-center justify-center text-[17px] font-extrabold text-white shrink-0 border-2 border-white/15">
                                {displayName.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="text-white text-sm font-extrabold mb-0.5">{displayName}</div>
                                <div className="text-white/40 text-[11px] font-semibold mb-1">{handle}</div>
                                {/* Lang bar */}
                                <div className="flex items-center gap-2.5">
                                  {nativeLang && (
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="text-lg">{LANG_FLAG[nativeLang] || "🌐"}</span>
                                      <span className="text-white/80 text-[11px] font-extrabold">{nativeLang.slice(0,2).toUpperCase()}</span>
                                      <div className="flex gap-0.5">{[1,2,3,4,5].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400"/>)}</div>
                                    </div>
                                  )}
                                  {learningLangs.length > 0 && <span className="text-white/40 text-sm">⇌</span>}
                                  {learningLangs.map((l,i) => {
                                    const f = LEVEL_DOTS[l.level] || 1;
                                    return (
                                      <span key={i} className="flex items-center gap-2">
                                        {i > 0 && <span className="w-px h-7 bg-white/15 inline-block"/>}
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className="text-lg">{LANG_FLAG[l.language] || "🌐"}</span>
                                          <span className="text-white/80 text-[11px] font-extrabold">{l.language.slice(0,2).toUpperCase()}</span>
                                          <div className="flex gap-0.5">{[1,2,3,4,5].map(d=><div key={d} className={`w-1.5 h-1.5 rounded-full ${d<=f?"bg-white/75":"bg-white/18"}`}/>)}</div>
                                        </div>
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-white/35 text-xs font-semibold">{timeAgo(post.createdAt)}</span>
                                {isOwn && (
                                  <button onClick={() => setMenuPostId(menuPostId === post._id ? null : post._id)}
                                    className="bg-transparent border-0 text-white/40 text-xl cursor-pointer p-0.5 leading-none">⋮</button>
                                )}
                              </div>
                            </div>

                            {/* 3-dot dropdown */}
                            {menuPostId === post._id && (
                              <div className="absolute top-[52px] right-0 z-50 bg-[#1a3575] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/12 overflow-hidden min-w-[140px]">
                                <button onClick={() => openEdit(post)}
                                  className="flex items-center gap-2.5 px-4 py-3 w-full bg-transparent border-0 text-white text-sm font-bold cursor-pointer text-left hover:bg-white/10 transition-colors">
                                  ✏️ Edit
                                </button>
                                <div className="h-px bg-white/10" />
                                <button onClick={() => handleDeletePost(post._id)}
                                  className="flex items-center gap-2.5 px-4 py-3 w-full bg-transparent border-0 text-[#ff8fa3] text-sm font-bold cursor-pointer text-left hover:bg-red-500/10 transition-colors">
                                  🗑️ Delete
                                </button>
                              </div>
                            )}

                            <p className="text-white/85 text-sm font-semibold leading-[1.55] mb-3">{post.text}</p>

                            {post.topics?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2.5">
                                {post.topics.map(t => (
                                  <span key={t} className="bg-[rgba(74,127,224,0.15)] border border-[rgba(74,127,224,0.3)] rounded-xl px-2.5 py-0.5 text-white/55 text-[11px] font-bold">{t}</span>
                                ))}
                              </div>
                            )}

                            <div className="flex justify-end text-white/35 text-xs font-bold mb-1.5">
                              {(post.likes||0)+(likedPosts.has(post._id)?1:0)} Likes &nbsp; {post.comments?.length||0} comments
                            </div>

                            <div className="flex border-t border-white/[0.06] -mx-5 px-5">
                              {[
                                { label:"Like", icon: likedPosts.has(post._id)?"❤️":"🤍", active: likedPosts.has(post._id), onClick: ()=>toggleLike(post._id) },
                                { label:"Comment", icon:"💬", active:false, onClick:()=>{} },
                                { label:"Translate", icon:"🌐", active:false, onClick:()=>{} },
                              ].map((a,i) => (
                                <button key={a.label} onClick={a.onClick}
                                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 bg-transparent border-0 text-xs font-bold cursor-pointer transition-colors
                                    ${a.active?"text-red-400":"text-white/50 hover:text-white/85"}
                                    ${i>0?"border-l border-white/10":""}`}>
                                  <span className="text-base">{a.icon}</span>{a.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {menuPostId && <div onClick={() => setMenuPostId(null)} className="fixed inset-0 z-40" />}
                  </div>

                  {/* Edit modal */}
                  {editPost && (
                    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end justify-center"
                      onClick={e => { if (e.target === e.currentTarget) setEditPost(null); }}>
                      <div className="w-full max-w-[390px] bg-gradient-to-br from-[#1a3575] to-[#162860] rounded-t-3xl px-5 pt-6 pb-9 shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-white text-base font-extrabold">Edit Post</span>
                          <button onClick={() => setEditPost(null)} className="bg-transparent border-0 text-white/45 text-2xl cursor-pointer leading-none">×</button>
                        </div>
                        <textarea value={editText} onChange={e => setEditText(e.target.value)} maxLength={1000}
                          className="w-full bg-white/10 border border-white/15 rounded-2xl p-3.5 text-white text-sm font-semibold resize-none min-h-[120px] outline-none leading-relaxed" />
                        <div className="flex gap-2.5 mt-3.5">
                          <button onClick={() => setEditPost(null)}
                            className="flex-1 bg-white/10 border border-white/15 rounded-2xl py-3.5 text-white/70 text-sm font-extrabold cursor-pointer">Cancel</button>
                          <button onClick={handleEditSave} disabled={editLoading}
                            className="flex-[2] bg-[#4a7fe0] border-0 rounded-2xl py-3.5 text-white text-sm font-extrabold cursor-pointer disabled:opacity-70">
                            {editLoading ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-[rgba(255,80,80,0.9)] text-white px-5 py-2.5 rounded-full text-[13px] font-bold z-[999] backdrop-blur-md">
                      {message}
                    </div>
                  )}
 
            
          </div>
        <BottomNav />
      </PhoneFrame>
  );
}