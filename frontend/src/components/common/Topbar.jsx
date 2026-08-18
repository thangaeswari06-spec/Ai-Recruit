import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMobileSidebar } from "../../hooks/useMobileSidebar";
import { getInitials } from "../../utils/helpers";
import NotificationBell from "../notifications/NotificationBell";

export default function Topbar({ title, subtitle, onSearch }) {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toggle: toggleMobileSidebar } = useMobileSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const displayName = profile?.name || user?.email?.split("@")[0] || "there";
  const avatarUrl = profile?.avatar_url;

  return (
    <header className="topbar">
      <button className="sidebar-toggle" onClick={toggleMobileSidebar} aria-label="Open menu">☰</button>

      <div style={{ minWidth: 0 }}>
        <h1 className="topbar-title">{title || "AI Recruitment Dashboard"}</h1>
        <p className="topbar-subtitle">{subtitle || `Welcome ${displayName} 👋`}</p>
      </div>

      <div className="topbar-actions" style={{ marginLeft: "auto" }}>
        {searchOpen && (
          <input
            autoFocus
            type="text"
            className="form-input"
            style={{ width: 200 }}
            placeholder="Search..."
            onChange={(e) => onSearch?.(e.target.value)}
            onBlur={() => setSearchOpen(false)}
          />
        )}
        <button className="icon-btn" onClick={() => setSearchOpen((v) => !v)} aria-label="Search">
          🔍
        </button>

        <NotificationBell />

        <button className="avatar-btn" onClick={() => setMenuOpen((v) => !v)}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            getInitials(displayName)
          )}
        </button>

        {menuOpen && (
          <div className="dropdown-menu topbar-position">
            <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate("/profile"); }}>
              👤 View Profile
            </button>
            <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate("/settings"); }}>
              ⚙️ Settings
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item danger" onClick={signOut}>
              🚪 Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
