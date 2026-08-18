// The app's signature visual: every AI match score renders as this 5-tick
// meter instead of a bare number, so "94%" always reads as a signal strength,
// not just a stat.
export default function SignalMeter({ score, showLabel = true, size = "md" }) {
  if (score == null) {
    return <span className="text-xs text-muted">Not scored</span>;
  }
  const lit = Math.round((score / 100) * 5);
  return (
    <span className="flex items-center gap-8">
      <span className="signal-meter" style={size === "sm" ? { transform: "scale(0.85)" } : undefined}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={`tick${i < lit ? " lit" : ""}`} />
        ))}
      </span>
      {showLabel && <span className="signal-score">{score}%</span>}
    </span>
  );
}