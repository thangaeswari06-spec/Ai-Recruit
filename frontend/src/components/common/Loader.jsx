export default function Loader({ label, fullscreen = false }) {
  const spinner = (
    <div className="flex flex-col items-center gap-8">
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: "3px solid var(--primary)", borderTopColor: "transparent",
        animation: "spin .7s linear infinite",
      }} />
      {label && <span className="text-sm text-muted">{label}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (fullscreen) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
        {spinner}
      </div>
    );
  }
  return spinner;
}