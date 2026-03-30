// src/pages/admin/AdminUsers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import API from "../../api/api";

const ROWS_PER_PAGE = 10;

function timeAgo(date) {
  if (!date) return "—";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hrs ago`;
  return `${Math.floor(diff/86400)} days ago`;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter]     = useState("All");
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      if (statusFilter === "Active")    result = result.filter(u => !u.isSuspended);
      if (statusFilter === "Suspended") result = result.filter(u => u.isSuspended);
    }
    if (roleFilter !== "All") {
      result = result.filter(u => u.role === roleFilter.toLowerCase());
    }
    setFiltered(result);
    setPage(1);
  }, [search, statusFilter, roleFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const handleSuspend = async (userId, suspend) => {
    try {
      const endpoint = suspend
        ? `/admin/users/${userId}/suspend`
        : `/admin/users/${userId}/unsuspend`;
      await API.put(endpoint);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: suspend } : u));
    } catch (err) { alert(err.response?.data?.message || "Action failed"); }
    setActionMenu(null);
  };

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <AdminLayout>
      <style>{`
        .au-page-header { margin-bottom: 24px; }
        .au-page-title { color: #1a2d6b; font-size: 22px; font-weight: 900; margin-bottom: 4px; }
        .au-page-sub   { color: #6b7fa3; font-size: 13px; font-weight: 600; }

        .au-filter-bar {
          background: #1a2d6b;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .au-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .au-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(255,255,255,0.4); font-size: 14px; }
        .au-search {
          width: 100%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 22px;
          padding: 9px 16px 9px 36px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 600;
          outline: none;
        }
        .au-search::placeholder { color: rgba(255,255,255,0.35); }

        .au-select {
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 22px;
          padding: 9px 16px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 700;
          outline: none;
          cursor: pointer;
        }
        .au-select option { background: #1a2d6b; }

        .au-add-btn {
          background: #4a7fe0;
          border: none;
          border-radius: 22px;
          padding: 9px 18px;
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s;
          margin-left: auto;
        }
        .au-add-btn:hover { background: #5a8ff0; }

        .au-table-wrap {
          background: #1a2d6b;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .au-table { width: 100%; border-collapse: collapse; }

        .au-table th {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.5);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 12px 16px;
          text-align: left;
          white-space: nowrap;
        }

        .au-table td {
          padding: 12px 16px;
          color: rgba(255,255,255,0.85);
          font-size: 13px;
          font-weight: 600;
          border-top: 1px solid rgba(255,255,255,0.05);
          vertical-align: middle;
        }

        .au-table tr:hover td { background: rgba(255,255,255,0.03); }

        .au-user-cell { display: flex; align-items: center; gap: 10px; }

        .au-user-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 800; color: white;
          flex-shrink: 0;
        }

        .au-user-name { color: #fff; font-weight: 800; font-size: 13px; }
        .au-user-email { color: rgba(255,255,255,0.4); font-size: 11px; }

        .badge {
          display: inline-flex; align-items: center;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 800;
        }
        .badge-active    { background: rgba(74,222,128,0.15); color: #4ade80; }
        .badge-suspended { background: rgba(248,113,113,0.15); color: #f87171; }
        .badge-admin     { background: rgba(74,127,224,0.2);  color: #7ab3f5; }
        .badge-user      { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); }

        .au-action-wrap { position: relative; }
        .au-action-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); font-size: 18px; padding: 4px 8px;
          transition: color 0.2s;
        }
        .au-action-btn:hover { color: #fff; }

        .au-action-icon-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); font-size: 15px; padding: 4px;
          transition: color 0.2s;
        }
        .au-action-icon-btn:hover { color: #fff; }
        .au-action-icon-btn.danger:hover { color: #f87171; }

        .au-dropdown {
          position: absolute; right: 0; top: 28px; z-index: 50;
          background: #243580; border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          overflow: hidden; min-width: 150px;
        }

        .au-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; width: 100%; background: none; border: none;
          color: rgba(255,255,255,0.75); font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: background 0.15s;
          text-align: left;
        }
        .au-dropdown-item:hover { background: rgba(255,255,255,0.07); }
        .au-dropdown-item.danger { color: #f87171; }
        .au-dropdown-item.danger:hover { background: rgba(255,100,100,0.1); }

        .au-pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 4px;
        }

        .au-rows-info { color: #6b7fa3; font-size: 13px; font-weight: 600; }

        .au-page-btns { display: flex; gap: 4px; }

        .au-page-btn {
          width: 32px; height: 32px; border-radius: 8px;
          background: #fff; border: none;
          color: #1a2d6b; font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .au-page-btn:hover:not(:disabled) { background: #e0e8f8; }
        .au-page-btn.active { background: #4a7fe0; color: #fff; }
        .au-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Page header */}
      <div className="au-page-header">
        <h1 className="au-page-title">User Management</h1>
        <p className="au-page-sub">Manage all users in one place. Control access, assign roles, and monitor activity across your platform.</p>
      </div>

      {/* Filter bar */}
      <div className="au-filter-bar">
        <div className="au-search-wrap">
          <span className="au-search-icon">🔍</span>
          <input className="au-search" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="au-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option>All</option>
          <option>User</option>
          <option>Admin</option>
        </select>
        <select className="au-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Active</option>
          <option>Suspended</option>
        </select>
        <button className="au-add-btn" onClick={() => navigate("/admin/users/new")}>+ Add User</button>
      </div>

      {/* Table */}
      <div className="au-table-wrap">
        <table className="au-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" /></th>
              <th>User Id</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,0.3)" }}>Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign:"center", padding:40, color:"rgba(255,255,255,0.3)" }}>No users found</td></tr>
            ) : paginated.map((user, i) => (
              <tr key={user._id}>
                <td><input type="checkbox" /></td>
                <td style={{ color:"rgba(255,255,255,0.4)", fontFamily:"monospace" }}>
                  {String((page-1)*ROWS_PER_PAGE + i + 1).padStart(4,"0")}
                </td>
                <td>
                  <div className="au-user-cell">
                    <div className="au-user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="au-user-name">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color:"rgba(255,255,255,0.6)" }}>{user.email}</td>
                <td>
                  <span className={`badge ${user.isSuspended ? "badge-suspended" : "badge-active"}`}>
                    {user.isSuspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${user.role === "admin" ? "badge-admin" : "badge-user"}`}>
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                </td>
                <td style={{ color:"rgba(255,255,255,0.5)" }}>
                  {new Date(user.createdAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}
                </td>
                <td style={{ color:"rgba(255,255,255,0.5)" }}>{timeAgo(user.updatedAt)}</td>
                <td>
                  <div className="au-action-wrap">
                    <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                      <button className="au-action-icon-btn" title="Edit" onClick={() => navigate(`/admin/users/edit/${user._id}`)}>✏️</button>
                      <button
                        className="au-action-icon-btn danger"
                        title={user.isSuspended ? "Unsuspend" : "Suspend"}
                        onClick={() => handleSuspend(user._id, !user.isSuspended)}
                      >
                        {user.isSuspended ? "✅" : "🚫"}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="au-pagination">
        <span className="au-rows-info">
          Rows per page: <strong>10</strong> &nbsp;·&nbsp; {filtered.length} total
        </span>
        <div className="au-page-btns">
          <button className="au-page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button className="au-page-btn" onClick={() => setPage(p => p-1)} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`au-page-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          {totalPages > 5 && <button className="au-page-btn" disabled>…</button>}
          <button className="au-page-btn" onClick={() => setPage(p => p+1)} disabled={page === totalPages}>›</button>
          <button className="au-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
        </div>
      </div>
    </AdminLayout>
  );
}