import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import BottomNav from "../components/BottomNav";
import PhoneFrame from "../components/PhoneFrame";

const LANG_FLAG = {
  English:"🇬🇧", Thai:"🇹🇭", Japanese:"🇯🇵", Korean:"🇰🇷",
  "Chinese (Mandarin)":"🇨🇳", French:"🇫🇷", German:"🇩🇪",
  Spanish:"🇪🇸", Italian:"🇮🇹", Portuguese:"🇵🇹",
  Arabic:"🇸🇦", Hindi:"🇮🇳", Russian:"🇷🇺", Vietnamese:"🇻🇳",
};

const LEVEL_DOTS = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:5 };

function timeAgo(date) {
  const d = Math.floor((Date.now() - new Date(date)) / 1000);
  if (d < 60) return `${d}s`;
  if (d < 3600) return `${Math.floor(d/60)}m`;
  if (d < 86400) return `${Math.floor(d/3600)}h`;
  return `${Math.floor(d/86400)}d`;
}

export default function MyPosts() {
  const navigate  = useNavigate();
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [menuPostId, setMenuPostId] = useState(null);
  const [editPost, setEditPost]     = useState(null);
  const [editText, setEditText]     = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const me      = JSON.parse(localStorage.getItem("user") || "{}");
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/posts/user/${me?.id}`);
      setPosts(res.data || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  const toggleLike = (postId) => setLikedPosts(prev => {
    const n = new Set(prev); n.has(postId) ? n.delete(postId) : n.add(postId); return n;
  });

  const handleDelete = async (postId) => {
    setMenuPostId(null);
    try { await API.delete(`/posts/${postId}`); setPosts(prev => prev.filter(p => p._id !== postId)); }
    catch {}
  };

  const openEdit = (post) => { setMenuPostId(null); setEditPost(post); setEditText(post.text); };

  const handleEditSave = async () => {
    if (!editText.trim()) return;
    setEditLoading(true);
    try {
      const res = await API.put(`/posts/${editPost._id}`, { text: editText.trim() });
      setPosts(prev => prev.map(p => p._id === editPost._id ? res.data : p));
      setEditPost(null);
    } catch {}
    finally { setEditLoading(false); }
  };

  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Header */}
        <div className="sticky top-0 z-50 bg-[#0f1c3f] px-4 py-4 flex items-center gap-3 border-b border-white/[0.06]">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/10 border-0 text-white text-lg cursor-pointer flex items-center justify-center hover:bg-white/15 transition-colors">
            ←
          </button>
          <h1 className="text-white text-lg font-black flex-1">My Posts</h1>
          <button onClick={() => navigate("/posts/new")}
            className="bg-[#4a7fe0] border-0 rounded-full px-4 py-2 text-white text-sm font-extrabold cursor-pointer hover:bg-[#5a8ff0] transition-colors">
            + New
          </button>
        </div>

        {/* Stats bar */}
        {posts.length > 0 && (
          <div className="flex justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-white/45 text-xs font-bold">{posts.length} Posts</span>
            <span className="text-white/45 text-xs font-bold">
              {posts.reduce((s,p) => s+(p.likes||0), 0)} Likes &nbsp;
              {posts.reduce((s,p) => s+(p.comments?.length||0), 0)} Comments
            </span>
          </div>
        )}

        {/* Click outside to close menu */}
        {menuPostId && <div className="fixed inset-0 z-40" onClick={() => setMenuPostId(null)} />}

        {/* Posts */}
        {loading ? (
          <div className="text-center py-16 text-white/30 text-sm">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <p className="text-4xl mb-3">✍️</p>
            <p className="text-sm font-semibold mb-4">No posts yet</p>
            <button onClick={() => navigate("/posts/new")}
              className="bg-[#4a7fe0] border-0 rounded-full px-5 py-2.5 text-white text-sm font-extrabold cursor-pointer hover:bg-[#5a8ff0] transition-colors">
              + Create first post
            </button>
          </div>
        ) : posts.map(post => (
          <div key={post._id} className="px-4 pt-4 border-b border-white/[0.07] relative">

            {/* Author row */}
            <div className="flex items-start gap-2.5 mb-2.5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f] flex items-center justify-center text-base font-extrabold text-white shrink-0 border-2 border-white/15">
                {(me?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-extrabold mb-0.5">{me?.name || "User"}</div>
                <div className="text-white/40 text-[11px] font-semibold">@{me?.email?.split("@")[0] || "user"}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-white/35 text-xs font-semibold">{timeAgo(post.createdAt)}</span>
                <button onClick={() => setMenuPostId(menuPostId === post._id ? null : post._id)}
                  className="bg-transparent border-0 text-white/40 text-xl cursor-pointer p-0.5 leading-none hover:text-white transition-colors">⋮</button>
              </div>
            </div>

            {/* Dropdown */}
            {menuPostId === post._id && (
              <div className="absolute top-14 right-4 z-50 bg-[#1a3575] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] border border-white/12 overflow-hidden min-w-[140px]">
                <button onClick={() => openEdit(post)}
                  className="flex items-center gap-2.5 px-4 py-3 w-full bg-transparent border-0 text-white text-sm font-bold cursor-pointer text-left hover:bg-white/10 transition-colors">
                  ✏️ Edit
                </button>
                <div className="h-px bg-white/10" />
                <button onClick={() => handleDelete(post._id)}
                  className="flex items-center gap-2.5 px-4 py-3 w-full bg-transparent border-0 text-[#ff8fa3] text-sm font-bold cursor-pointer text-left hover:bg-red-500/10 transition-colors">
                  🗑️ Delete
                </button>
              </div>
            )}

            {/* Post text */}
            <p className="text-white/85 text-sm font-semibold leading-[1.55] mb-2.5">{post.text}</p>

            {/* Topics */}
            {post.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {post.topics.map(t => (
                  <span key={t} className="bg-[rgba(74,127,224,0.15)] border border-[rgba(74,127,224,0.3)] rounded-xl px-2.5 py-0.5 text-white/55 text-[11px] font-bold">{t}</span>
                ))}
              </div>
            )}

            {/* Likes count */}
            <div className="flex justify-end text-white/35 text-xs font-bold pb-1.5">
              {(post.likes||0)+(likedPosts.has(post._id)?1:0)} likes &nbsp; {post.comments?.length||0} comments
            </div>

            {/* Actions */}
            <div className="flex border-t border-white/[0.06] -mx-4">
              {[
                { label:"Like", icon: likedPosts.has(post._id)?"❤️":"🤍", active: likedPosts.has(post._id), onClick: ()=>toggleLike(post._id) },
                { label:"Comment", icon:"💬", active:false, onClick:()=>{} },
                { label:"Translate", icon:"🌐", active:false, onClick:()=>{} },
              ].map((a, i) => (
                <button key={a.label} onClick={a.onClick}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-transparent border-0 text-xs font-bold cursor-pointer transition-colors
                    ${a.active ? "text-red-400" : "text-white/45 hover:text-white/80"}
                    ${i > 0 ? "border-l border-white/[0.06]" : ""}`}>
                  <span className="text-base">{a.icon}</span>{a.label}
                </button>
              ))}
            </div>
          </div>
        ))}

      </div>

      {/* Edit modal */}
      {editPost && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-end justify-center"
          onClick={e => { if (e.target === e.currentTarget) setEditPost(null); }}>
          <div className="w-full max-w-[390px] bg-gradient-to-br from-[#1a3575] to-[#162860] rounded-t-3xl px-5 pt-6 pb-9">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-base font-extrabold">Edit Post</span>
              <button onClick={() => setEditPost(null)} className="bg-transparent border-0 text-white/45 text-2xl cursor-pointer">×</button>
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

      <BottomNav />
    </PhoneFrame>
  );
}