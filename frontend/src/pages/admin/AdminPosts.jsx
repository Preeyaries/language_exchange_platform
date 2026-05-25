import { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import API from "../../api/api";
import { getAvatarUrl } from "../../utils/avatarUrl";


const DAYS   = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function AdminPosts() {
  const [posts, setPosts]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [menuId, setMenuId]     = useState(null);
  const [showCal, setShowCal]   = useState(false);
  const [selDate, setSelDate]   = useState(null);
  const [calMonth, setCalMonth] = useState(new Date());

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    let result = [...posts];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.text?.toLowerCase().includes(q) || p.author?.name?.toLowerCase().includes(q)
      );
    }
    if (selDate) {
      result = result.filter(p => new Date(p.createdAt).toDateString() === selDate.toDateString());
    }
    setFiltered(result);
  }, [search, selDate, posts]);

  const fetchPosts = async () => {
    setLoading(true);
    try { const res = await API.get("/posts"); setPosts(res.data || []); }
    catch { setPosts([]); }
    finally { setLoading(false); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try { await API.delete(`/admin/posts/${postId}`); setPosts(prev => prev.filter(p => p._id !== postId)); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    setMenuId(null);
  };

  const firstDay    = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth()+1, 0).getDate();

  return (
    <AdminLayout>
      {/* Click outside to close menus */}
      {(menuId || showCal) && (
        <div className="fixed inset-0 z-40" onClick={() => { setMenuId(null); setShowCal(false); }} />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[#1a2d6b] text-2xl font-black mb-1">Post Management</h1>
        <p className="text-[#6b7fa3] text-sm font-semibold">Manage all user's post in one place.</p>
      </div>

      {/* Filter bar */}
      <div className="bg-[#1a2d6b] rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">🔍</span>
          <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/15 rounded-full py-2 pl-9 pr-4
              text-white text-sm font-semibold outline-none placeholder:text-white/35 focus:border-white/30 transition-all" />
        </div>

        {/* Date picker */}
        <div className="relative z-50">
          <button onClick={e => { e.stopPropagation(); setShowCal(!showCal); }}
            className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full py-2 px-4
              text-white text-sm font-bold cursor-pointer hover:bg-white/15 transition-colors">
            📅 {selDate ? selDate.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "Date"}
            {selDate && (
              <span onClick={e => { e.stopPropagation(); setSelDate(null); }}
                className="ml-1 opacity-50 text-sm leading-none">×</span>
            )}
          </button>

          {/* Calendar dropdown */}
          {showCal && (
            <div className="absolute top-11 left-0 z-[100] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-4 w-72"
              onClick={e => e.stopPropagation()}>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}
                  className="bg-transparent border-0 text-[#1a2d6b] text-base cursor-pointer px-2 py-1 hover:bg-[#e8eef8] rounded-lg transition-colors">‹</button>
                <span className="text-[#1a2d6b] text-sm font-extrabold">{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
                <button onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}
                  className="bg-transparent border-0 text-[#1a2d6b] text-base cursor-pointer px-2 py-1 hover:bg-[#e8eef8] rounded-lg transition-colors">›</button>
              </div>
              {/* Grid */}
              <div className="grid grid-cols-7 gap-0.5">
                {DAYS.map(d => (
                  <div key={d} className="text-[#6b7fa3] text-[10px] font-extrabold text-center py-1">{d}</div>
                ))}
                {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day      = i + 1;
                  const thisDate = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
                  const isToday  = thisDate.toDateString() === new Date().toDateString();
                  const isSel    = selDate && thisDate.toDateString() === selDate.toDateString();
                  return (
                    <button key={day} onClick={() => { setSelDate(thisDate); setShowCal(false); }}
                      className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold border-0 cursor-pointer transition-colors
                        ${isSel ? "bg-[#4a7fe0] text-white" : isToday ? "border-2 border-[#4a7fe0] text-[#4a7fe0] bg-transparent font-black" : "text-[#1a2d6b] bg-transparent hover:bg-[#e8eef8]"}`}>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <span className="text-white/40 text-sm font-semibold ml-auto">{filtered.length} posts</span>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-16 text-[#6b7fa3] text-sm font-semibold">Loading posts...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6b7fa3] text-sm font-semibold">No posts found</div>
      ) : filtered.map((post, idx) => (
        <div key={post._id} className="bg-[#1a2d6b] rounded-2xl px-5 py-4 mb-3.5 relative"
          style={{ animation:`fadeUp 0.3s ease ${idx*0.04}s both` }}>

          {/* Top row */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/[0.07]">
              <img
                src={getAvatarUrl(null, post.author?._id, post.author?.gender)}
                alt=""
                className="w-10 h-10 rounded-full object-cover shrink-0"
              />
            <div className="flex-1 min-w-0">
              <div className="text-white/85 text-[13px] font-extrabold">Post Id: {String(idx+1).padStart(5,"0")}</div>
              <div className="text-white/45 text-xs font-semibold truncate">User name: {post.author?.name || "Unknown"}</div>
            </div>
            <div className="text-white/35 text-xs font-semibold shrink-0 hidden sm:block">
              {new Date(post.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
              {" "}
              {new Date(post.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
            </div>
            {/* 3-dot menu — spacer so it doesn't overlap date */}
            <div className="w-8 shrink-0" />
          </div>

          {/* Post text */}
          <p className="text-white/80 text-sm font-semibold leading-relaxed mb-2.5">{post.text}</p>

          {/* Topics */}
          {post.topics?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.topics.map(t => (
                <span key={t} className="bg-white/8 rounded-full px-3 py-1 text-white/50 text-[11px] font-bold">{t}</span>
              ))}
            </div>
          )}

          {/* 3-dot button */}
          <button onClick={e => { e.stopPropagation(); setMenuId(menuId === post._id ? null : post._id); }}
            className="absolute top-4 right-4 bg-transparent border-0 text-white/40 text-xl cursor-pointer px-1.5 py-0.5 leading-none hover:text-white transition-colors z-50">
            ⋮
          </button>

          {/* Dropdown */}
          {menuId === post._id && (
            <div className="absolute top-11 right-4 z-50 bg-[#243580] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden min-w-[130px]"
              onClick={e => e.stopPropagation()}>
              <button className="flex items-center gap-2.5 px-4 py-3 w-full bg-transparent border-0 text-white/75 text-sm font-bold cursor-pointer text-left hover:bg-white/7 transition-colors">
                ✏️ Edit
              </button>
              <button onClick={() => handleDelete(post._id)}
                className="flex items-center gap-2.5 px-4 py-3 w-full bg-transparent border-0 text-red-400 text-sm font-bold cursor-pointer text-left hover:bg-red-500/10 transition-colors">
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </AdminLayout>
  );
}