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

const Badge = ({ active, label }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold
    ${active ? "bg-green-400/15 text-green-400" : "bg-red-400/15 text-red-400"}`}>
    {label}
  </span>
);

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold
    ${role === "admin" ? "bg-[#4a7fe0]/20 text-[#7ab3f5]" : "bg-white/8 text-white/50"}`}>
    {role === "admin" ? "Admin" : "User"}
  </span>
);

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter]     = useState("All");
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    if (statusFilter === "Active")    result = result.filter(u => !u.isSuspended);
    if (statusFilter === "Suspended") result = result.filter(u => u.isSuspended);
    if (roleFilter !== "All")         result = result.filter(u => u.role === roleFilter.toLowerCase());
    setFiltered(result);
    setPage(1);
  }, [search, statusFilter, roleFilter, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await API.get("/admin/users"); setUsers(res.data || []); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const handleSuspend = async (userId, suspend) => {
    try {
      await API.put(`/admin/users/${userId}/${suspend ? "suspend" : "unsuspend"}`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: suspend } : u));
    } catch (err) { alert(err.response?.data?.message || "Action failed"); }
  };

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated  = filtered.slice((page-1)*ROWS_PER_PAGE, page*ROWS_PER_PAGE);

  const SelectFilter = ({ value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-white/10 border border-white/15 rounded-full py-2 px-4 text-white text-sm font-bold outline-none cursor-pointer appearance-none"
      style={{ colorScheme:"dark" }}>
      {options.map(o => <option key={o} value={o} style={{ background:"#1a2d6b" }}>{o}</option>)}
    </select>
  );

  const PageBtn = ({ onClick, disabled, active, children }) => (
    <button onClick={onClick} disabled={disabled}
      className={`w-8 h-8 rounded-lg border-0 text-sm font-bold cursor-pointer flex items-center justify-center transition-all
        ${active ? "bg-[#4a7fe0] text-white" : "bg-white text-[#1a2d6b] hover:bg-[#e0e8f8]"}
        disabled:opacity-40 disabled:cursor-not-allowed`}>
      {children}
    </button>
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[#1a2d6b] text-2xl font-black mb-1">User Management</h1>
        <p className="text-[#6b7fa3] text-sm font-semibold">Manage all users in one place. Control access, assign roles, and monitor activity.</p>
      </div>

      {/* Filter bar */}
      <div className="bg-[#1a2d6b] rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">🔍</span>
          <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/15 rounded-full py-2 pl-9 pr-4
              text-white text-sm font-semibold outline-none placeholder:text-white/35 focus:border-white/30 transition-all" />
        </div>
        <SelectFilter value={roleFilter} onChange={setRoleFilter} options={["All","User","Admin"]} />
        <SelectFilter value={statusFilter} onChange={setStatusFilter} options={["All","Active","Suspended"]} />
        <button onClick={() => navigate("/admin/users/new")}
          className="bg-[#4a7fe0] border-0 rounded-full py-2 px-5 text-white text-sm font-extrabold cursor-pointer ml-auto whitespace-nowrap hover:bg-[#5a8ff0] transition-colors">
          + Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1a2d6b] rounded-2xl overflow-hidden mb-4">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="w-10 px-4 py-3 text-left"><input type="checkbox" className="accent-[#4a7fe0]" /></th>
                {["User Id","Full Name","Email","Status","Role","Joined Date","Last Active","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-white/50 text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-white/30 text-sm">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-white/30 text-sm">No users found</td></tr>
              ) : paginated.map((user, i) => (
                <tr key={user._id} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" className="accent-[#4a7fe0]" /></td>
                  <td className="px-4 py-3 text-white/40 font-mono text-[13px]">{String((page-1)*ROWS_PER_PAGE+i+1).padStart(4,"0")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f] flex items-center justify-center text-[13px] font-extrabold text-white shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-extrabold text-[13px]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/60 text-[13px]">{user.email}</td>
                  <td className="px-4 py-3"><Badge active={!user.isSuspended} label={user.isSuspended?"Suspended":"Active"} /></td>
                  <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                  <td className="px-4 py-3 text-white/50 text-[13px] whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
                  </td>
                  <td className="px-4 py-3 text-white/50 text-[13px] whitespace-nowrap">{timeAgo(user.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/admin/users/edit/${user._id}`)} title="Edit"
                        className="bg-transparent border-0 text-base cursor-pointer p-1 text-white/40 hover:text-white transition-colors">✏️</button>
                      <button onClick={() => handleSuspend(user._id, !user.isSuspended)}
                        title={user.isSuspended?"Unsuspend":"Suspend"}
                        className="bg-transparent border-0 text-base cursor-pointer p-1 text-white/40 hover:text-red-400 transition-colors">
                        {user.isSuspended ? "✅" : "🚫"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-white/5">
          {loading ? (
            <div className="text-center py-10 text-white/30 text-sm">Loading...</div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-10 text-white/30 text-sm">No users found</div>
          ) : paginated.map(user => (
            <div key={user._id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4a7fe0] to-[#2a4a8f] flex items-center justify-center text-sm font-extrabold text-white shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-extrabold text-sm truncate">{user.name}</div>
                <div className="text-white/45 text-xs truncate">{user.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge active={!user.isSuspended} label={user.isSuspended?"Suspended":"Active"} />
                  <RoleBadge role={user.role} />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                  className="bg-transparent border-0 text-base cursor-pointer p-1 text-white/40 hover:text-white transition-colors">✏️</button>
                <button onClick={() => handleSuspend(user._id, !user.isSuspended)}
                  className="bg-transparent border-0 text-base cursor-pointer p-1 text-white/40 hover:text-red-400 transition-colors">
                  {user.isSuspended ? "✅" : "🚫"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[#6b7fa3] text-sm font-semibold">
          Rows per page: <strong>10</strong> &nbsp;·&nbsp; {filtered.length} total
        </span>
        <div className="flex gap-1">
          <PageBtn onClick={() => setPage(1)} disabled={page===1}>«</PageBtn>
          <PageBtn onClick={() => setPage(p=>p-1)} disabled={page===1}>‹</PageBtn>
          {Array.from({ length: Math.min(totalPages,5) }, (_,i) => i+1).map(p => (
            <PageBtn key={p} onClick={() => setPage(p)} active={page===p}>{p}</PageBtn>
          ))}
          {totalPages > 5 && <PageBtn disabled>…</PageBtn>}
          <PageBtn onClick={() => setPage(p=>p+1)} disabled={page===totalPages}>›</PageBtn>
          <PageBtn onClick={() => setPage(totalPages)} disabled={page===totalPages}>»</PageBtn>
        </div>
      </div>
    </AdminLayout>
  );
}