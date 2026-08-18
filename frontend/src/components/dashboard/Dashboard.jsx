import { useEffect, useState } from "react";
import Sidebar from "../common/Sidebar";
import Topbar from "../common/Topbar";
import StatsCard from "./StatsCard";
import { getFunnelCounts, getRecentActivities } from "../../services/analyticsService";
import { timeAgo } from "../../utils/helpers";

const CARDS = [
  { key: "applied", label: "Applied", icon: "📥" },
  { key: "screened", label: "Screened", icon: "🤖" },
  { key: "shortlisted", label: "Shortlisted", icon: "⭐" },
  { key: "interview_scheduled", label: "Interview Scheduled", icon: "📅" },
  { key: "interviewed", label: "Interviewed", icon: "🎤" },
  { key: "hired", label: "Hired", icon: "✅" },
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [funnel, recent] = await Promise.all([getFunnelCounts(), getRecentActivities()]);
        if (!active) return;
        setCounts(funnel || {});
        setActivities(recent || []);
      } catch (err) {
        if (active) setError(err.message || "Could not load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-body">
          {error && (
            <div className="card" style={{ background: "var(--danger-light)", color: "var(--danger)", marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div className="grid-stats">
            {CARDS.map((c) => (
              <StatsCard key={c.key} label={c.label} value={counts[c.key] ?? 0} icon={c.icon} loading={loading} />
            ))}
          </div>

          <div className="card mt-24">
            <p className="card-title">Recent activities</p>
            {activities.length === 0 && !loading && <p className="text-sm text-muted">No recent activity yet.</p>}
            {activities.map((a) => (
              <div key={a.id} className="flex items-center gap-12" style={{ padding: "8px 0" }}>
                <span className="badge badge-accent" style={{ width: 22, height: 22, borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
                <span style={{ flex: 1, fontSize: 13 }}>{a.message}</span>
                <span className="text-xs text-muted">{timeAgo(a.created_at)}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}