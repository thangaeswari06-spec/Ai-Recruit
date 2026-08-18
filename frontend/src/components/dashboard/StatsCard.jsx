export default function StatsCard({ label, value, icon, loading }) {
  return (
    <div className="stat-card">
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{loading ? "—" : value}</p>
      </div>
      <span className="stat-icon" style={{ fontFamily: "var(--font-mono)" }}>{icon}</span>
    </div>
  );
}