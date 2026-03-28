// src/pages/admin/AdminPosts.jsx
import { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/AdminLayout";
import API from "../../api/api";

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
        p.text?.toLowerCase().includes(q) ||
        p.author?.name?.toLowerCase().includes(q)
      );
    }
    if (selDate) {
      result = result.filter(p => {
        const d = new Date(p.createdAt);
        return d.toDateString() === selDate.toDateString();
      });
    }
    setFiltered(result);
  }, [search, selDate, posts]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get("/posts");
      setPosts(res.data || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/admin/posts/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    setMenuId(null);
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(calMonth);
  const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <AdminLayout>
      <style>{`
        .ap-header { margin-bottom: 24px; }
        .ap-title  { color: #1a2d6b; font-size: 22px; font-weight: 900; margin-bottom: 4px; }
        .ap-sub    { color: #6b7fa3; font-size: 13px; font-weight: 600; }

        .ap-filter-bar {
          background: #1a2d6b;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .ap-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .ap-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); font-size: 14px; }
        .ap-search {
          width: 100%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 22px;
          padding: 9px 16px 9px 36px;
          color: #fff; font-family: 'Nunito',sans-serif;
          font-size: 13px; font-weight: 600; outline: none;
        }
        .ap-search::placeholder { color: rgba(255,255,255,0.35); }

        /* Date picker button */
        .ap-date-btn {
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 22px;
          padding: 9px 16px;
          color: #fff; font-family: 'Nunito',sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          position: relative;
        }

        /* Calendar */
        .ap-calendar {
          position: absolute; top: 44px; left: 0; z-index: 100;
          background: #fff; border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          padding: 16px; width: 280px;
        }

        .ap-cal-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }

        .ap-cal-nav {
          background: none; border: none; cursor: pointer;
          color: #1a2d6b; font-size: 16px; padding: 4px 8px;
        }

        .ap-cal-month { color: #1a2d6b; font-size: 14px; font-weight: 800; }

        .ap-cal-grid {
          display: grid; grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .ap-cal-dayname {
          color: #6b7fa3; font-size: 10px; font-weight: 800;
          text-align: center; padding: 4px 0;
        }

        .ap-cal-day {
          aspect-ratio: 1; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; cursor: pointer;
          color: #1a2d6b; background: none; border: none;
          transition: background 0.15s;
        }

        .ap-cal-day:hover { background: #e8eef8; }
        .ap-cal-day.selected { background: #4a7fe0; color: #fff; }
        .ap-cal-day.today { font-weight: 900; border: 2px solid #4a7fe0; color: #4a7fe0; }
        .ap-cal-day.selected.today { color: #fff; }

        /* Post cards */
        .ap-post-card {
          background: #1a2d6b;
          border-radius: 16px;
          padding: 18px 20px;
          margin-bottom: 14px;
          position: relative;
          animation: fadeUp 0.3s ease both;
        }

        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .ap-post-top {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .ap-post-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 800; color: white; flex-shrink: 0;
        }

        .ap-post-id   { color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 800; }
        .ap-post-user { color: rgba(255,255,255,0.45); font-size: 12px; font-weight: 600; }

        .ap-post-date {
          margin-left: auto;
          color: rgba(255,255,255,0.35);
          font-size: 12px; font-weight: 600;
          white-space: nowrap;
        }

        .ap-post-text {
          color: rgba(255,255,255,0.8);
          font-size: 14px; font-weight: 600;
          line-height: 1.6; margin-bottom: 10px;
        }

        .ap-post-topics {
          display: flex; flex-wrap: wrap; gap: 6px;
        }

        .ap-topic-chip {
          background: rgba(255,255,255,0.08);
          border-radius: 20px; padding: 4px 12px;
          color: rgba(255,255,255,0.5); font-size: 11px; font-weight: 700;
        }

        /* Action menu */
        .ap-menu-btn {
          position: absolute; top: 18px; right: 18px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); font-size: 20px; padding: 2px 6px;
        }

        .ap-menu-btn:hover { color: #fff; }

        .ap-dropdown {
          position: absolute; top: 44px; right: 18px; z-index: 50;
          background: #243580; border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          overflow: hidden; min-width: 130px;
        }

        .ap-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; width: 100%; background: none; border: none;
          color: rgba(255,255,255,0.75); font-family: 'Nunito',sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: background 0.15s; text-align: left;
        }
        .ap-dropdown-item:hover { background: rgba(255,255,255,0.07); }
        .ap-dropdown-item.danger { color: #f87171; }
        .ap-dropdown-item.danger:hover { background: rgba(255,100,100,0.1); }

        .ap-empty { text-align: center; padding: 60px; color: #6b7fa3; font-size: 14px; font-weight: 600; }
      `}</style>

      {/* Click outside to close menus */}
      {(menuId || showCal) && (
        <div style={{ position:"fixed", inset:0, zIndex:40 }}
          onClick={() => { setMenuId(null); setShowCal(false); }} />
      )}

      <div className="ap-header">
        <h1 className="ap-title">Post Management</h1>
        <p className="ap-sub">Manage all user's post in one place.</p>
      </div>

      <div className="ap-filter-bar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon">🔍</span>
          <input className="ap-search" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Date picker */}
        <div style={{ position:"relative" }}>
          <button className="ap-date-btn" onClick={e => { e.stopPropagation(); setShowCal(!showCal); }}>
            📅 {selDate ? selDate.toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" }) : "Date"}
            {selDate && (
              <span onClick={e => { e.stopPropagation(); setSelDate(null); }}
                style={{ marginLeft:4, opacity:0.5, fontSize:14 }}>×</span>
            )}
          </button>

          {showCal && (
            <div className="ap-calendar" onClick={e => e.stopPropagation()}>
              <div className="ap-cal-header">
                <button className="ap-cal-nav" onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth()-1, 1))}>‹</button>
                <span className="ap-cal-month">{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
                <button className="ap-cal-nav" onClick={() => setCalMonth(d => new Date(d.getFullYear(), d.getMonth()+1, 1))}>›</button>
              </div>
              <div className="ap-cal-grid">
                {DAYS.map(d => <div key={d} className="ap-cal-dayname">{d}</div>)}
                {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const thisDate = new Date(calMonth.getFullYear(), calMonth.getMonth(), day);
                  const isToday = thisDate.toDateString() === new Date().toDateString();
                  const isSelected = selDate && thisDate.toDateString() === selDate.toDateString();
                  return (
                    <button key={day}
                      className={`ap-cal-day ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                      onClick={() => { setSelDate(thisDate); setShowCal(false); }}
                    >{day}</button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="ap-empty">Loading posts...</div>
      ) : filtered.length === 0 ? (
        <div className="ap-empty">No posts found</div>
      ) : filtered.map((post, idx) => (
        <div key={post._id} className="ap-post-card" style={{ animationDelay:`${idx*0.04}s` }}>
          <div className="ap-post-top">
            <div className="ap-post-avatar">{post.author?.name?.charAt(0).toUpperCase() || "U"}</div>
            <div>
              <div className="ap-post-id">Post Id: {String(idx+1).padStart(5,"0")}</div>
              <div className="ap-post-user">User name: {post.author?.name || "Unknown"}</div>
            </div>
            <div className="ap-post-date">
              {new Date(post.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
              &nbsp;
              {new Date(post.createdAt).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
            </div>
          </div>

          <p className="ap-post-text">{post.text}</p>

          {post.topics?.length > 0 && (
            <div className="ap-post-topics">
              {post.topics.map(t => <span key={t} className="ap-topic-chip">{t}</span>)}
            </div>
          )}

          {/* 3-dot menu */}
          <button className="ap-menu-btn" onClick={e => { e.stopPropagation(); setMenuId(menuId === post._id ? null : post._id); }}>⋮</button>

          {menuId === post._id && (
            <div className="ap-dropdown" onClick={e => e.stopPropagation()}>
              <button className="ap-dropdown-item">✏️ Edit</button>
              <button className="ap-dropdown-item danger" onClick={() => handleDelete(post._id)}>🗑️ Delete</button>
            </div>
          )}
        </div>
      ))}
    </AdminLayout>
  );
}