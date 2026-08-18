import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMobileSidebar } from "../../hooks/useMobileSidebar";
import { NAV_ITEMS } from "../../utils/constants";
import { getInitials } from "../../utils/helpers";

const ICONS = {
  LayoutDashboard: "🏠", Briefcase: "📁", Users: "👥", CalendarClock: "🎤",
  BarChart3: "📊", Sparkles: "✨", ShieldCheck: "🛡️", Settings: "⚙️",
};

export default function Sidebar() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { open: mobileOpen, close: closeMobile } = useMobileSidebar();

  const role = profile?.role;
  const displayName = profile?.name || user?.email?.split("@")[0] || "there";
  const avatarUrl = profile?.avatar_url;
  const items = NAV_ITEMS.filter((item) => !role || item.roles.includes(role));

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={closeMobile} />}
      <aside className={`sidebar${mobileOpen ? " open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-badge">AR</div>
          <span className="sidebar-logo-text">AI Recruit</span>
          <button className="sidebar-close-btn" onClick={closeMobile} aria-label="Close menu">✕</button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-link-icon">{ICONS[item.icon] || "•"}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-tip">
          <p className="sidebar-tip-title">AI TIP</p>
          <p className="sidebar-tip-text">3 candidates matched a new role today</p>
        </div>

        <div className="sidebar-profile">
          {menuOpen && (
            <div className="dropdown-menu sidebar-position">
              <button className="dropdown-item" onClick={() => { setMenuOpen(false); closeMobile(); navigate("/profile"); }}>
                👤 View Profile
              </button>
              <button className="dropdown-item" onClick={() => { setMenuOpen(false); closeMobile(); navigate("/settings"); }}>
                ⚙️ Settings
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={signOut}>
                🚪 Sign Out
              </button>
            </div>
          )}
          <div className="sidebar-profile-row" onClick={() => setMenuOpen((v) => !v)}>
            <div className="avatar-circle">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div className="sidebar-profile-info">
              <p className="sidebar-profile-name">{displayName}</p>
              <p className="sidebar-profile-email">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
