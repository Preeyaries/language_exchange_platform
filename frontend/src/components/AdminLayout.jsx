import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "User Management", icon: "👥", path: "/admin/users" },
  { label: "Post Management", icon: "📝", path: "/admin/posts" },
  { label: "Tag Management",  icon: "🏷️", path: "/admin/tags"  },
];

function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-[#0f1c3f]">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a2d6b] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 40 40" width="24" height="24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              <text x="7" y="15" fill="white" fontSize="9" fontWeight="800" fontFamily="Nunito">A</text>
              <rect x="19" y="14" width="18" height="14" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              <text x="23" y="24" fill="white" fontSize="8" fontWeight="800" fontFamily="Nunito">文</text>
            </svg>
          </div>
          <div>
            <div className="text-white font-black text-base leading-none">Bello!</div>
            <div className="text-white/40 text-[11px] font-semibold mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold no-underline transition-colors
                ${active
                  ? "bg-[#4a7fe0] text-white"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
                }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold
            text-[#ff8fa3] bg-transparent border-0 cursor-pointer text-left
            hover:bg-red-500/10 transition-colors">
          <span className="text-base">🚪</span>
          Log Out
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#e8eef8]" style={{ fontFamily:"'Nunito',sans-serif" }}>

      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0 shadow-xl">
        <div className="sticky top-0 h-screen">
          <Sidebar onClose={() => {}} />
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
            onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full z-[101] lg:hidden shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-50 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden bg-transparent border-0 text-[#1a2d6b] text-2xl cursor-pointer leading-none">
            ☰
          </button>

          <h2 className="text-[#1a2d6b] font-black text-lg">
            {NAV_ITEMS.find(n => n.path === location.pathname)?.label || "Admin"}
          </h2>

          <div className="flex-1" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1a2d6b] flex items-center justify-center text-white text-sm font-extrabold shrink-0">
              A
            </div>
            <span className="text-[#1a2d6b] text-sm font-bold hidden sm:block">Admin</span>
          </div>
        </header>

        {/* Content with proper padding */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}