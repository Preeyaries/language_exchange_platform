// src/components/AdminLayout.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/admin/users",  label: "User Management",  icon: "👤" },
  { path: "/admin/posts",  label: "Post Management",  icon: "📝" },
  { path: "/admin/tags",   label: "Tag Management",   icon: "🏷️" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const me = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .admin-root {
          min-height: 100vh;
          background: #e8eef8;
          font-family: 'Nunito', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* Top header */
        .admin-topbar {
          background: #1a2d6b;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }

        .admin-topbar-title {
          color: #fff;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.3px;
        }

        .admin-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-topbar-name {
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          font-weight: 700;
        }

        .admin-logout-btn {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 6px 14px;
          color: rgba(255,255,255,0.7);
          font-family: 'Nunito', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }

        .admin-logout-btn:hover {
          background: rgba(255,100,100,0.2);
          border-color: rgba(255,100,100,0.4);
          color: #ff8fa3;
        }

        /* Body */
        .admin-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Sidebar */
        .admin-sidebar {
          width: 220px;
          background: #1a2d6b;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          min-height: calc(100vh - 64px);
        }

        /* Admin info */
        .admin-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 16px;
        }

        .admin-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4a7fe0, #2a4a8f);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
        }

        .admin-info-name {
          color: #fff;
          font-size: 14px;
          font-weight: 800;
        }

        .admin-info-role {
          color: rgba(255,255,255,0.4);
          font-size: 11px;
          font-weight: 600;
        }

        /* Nav items */
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 20px;
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          border-left: 3px solid transparent;
        }

        .admin-nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
        }

        .admin-nav-item.active {
          background: rgba(74,127,224,0.2);
          color: #fff;
          border-left-color: #4a7fe0;
        }

        .admin-nav-icon {
          font-size: 17px;
          width: 22px;
          text-align: center;
        }

        /* Main content */
        .admin-main {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
          background: #e8eef8;
        }

        /* Page header */
        .admin-page-header {
          margin-bottom: 24px;
        }

        .admin-page-title {
          color: #1a2d6b;
          font-size: 24px;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .admin-page-subtitle {
          color: #6b7fa3;
          font-size: 13px;
          font-weight: 600;
        }

        /* Greeting bar */
        .admin-greeting {
          background: linear-gradient(135deg, #1a2d6b 0%, #2a4a9f 100%);
          color: #fff;
          padding: 20px 32px;
          font-size: 22px;
          font-weight: 900;
          flex-shrink: 0;
        }
      `}</style>

      <div className="admin-root">
        {/* Greeting */}
        <div className="admin-greeting">
          Hi, Admin {me.name?.split(" ")[0] || "Admin"}!
        </div>

        <div className="admin-body">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <div className="admin-info">
              <div className="admin-avatar">
                {(me.name || "A").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="admin-info-name">{me.name || "Admin"}</div>
                <div className="admin-info-role">Administrator</div>
              </div>
            </div>

            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${location.pathname === item.path ? "active" : ""}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div style={{ flex: 1 }} />

            <button
              className="admin-logout-btn"
              style={{ margin: "0 20px 20px" }}
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              🚪 Log Out
            </button>
          </aside>

          {/* Main */}
          <main className="admin-main">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}