import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Shared header for every candidate-facing page. Previously each portal page
// was an isolated centered card with no way to get from "Browse Jobs" to
// "My Applications" without editing the URL by hand.
export default function PortalNav() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/portal/jobs", label: "Browse Jobs" },
    { to: "/portal/status", label: "My Applications" },
  ];

  return (
    <header className="portal-nav">
      <div className="portal-nav-inner">
        <Link to="/portal/jobs" className="portal-nav-brand">
          <span className="sidebar-logo-badge">AR</span>
          <span className="portal-nav-brand-text">AI Recruit</span>
        </Link>

        <nav className="portal-nav-links">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`portal-nav-link ${location.pathname === l.to ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="portal-nav-actions">
          {user ? (
            <>
              <span className="portal-nav-user text-sm text-muted">{user.email}</span>
              <button className="btn btn-sm" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <Link to="/portal/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}