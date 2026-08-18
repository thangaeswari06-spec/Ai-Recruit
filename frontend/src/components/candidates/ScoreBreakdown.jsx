import SignalMeter from "../common/SignalMeter";

export default function ScoreBreakdown({ score, matchedSkills = [], missingSkills = [], summary }) {
  return (
    <div className="card">
      <div className="flex justify-between items-center mt-8" style={{ marginBottom: 16 }}>
        <p className="card-title" style={{ marginBottom: 0 }}>AI match score</p>
        <SignalMeter score={score} />
      </div>
      <div style={{ width: "100%", height: 6, background: "#eef0f4", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ width: `${score ?? 0}%`, height: "100%", background: "var(--match)", borderRadius: 8 }} />
      </div>
      {summary && <p className="text-sm mt-8" style={{ marginBottom: 16, lineHeight: 1.5 }}>{summary}</p>}
      <div className="form-row">
        <div>
          <p className="text-xs" style={{ fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>Matched skills</p>
          <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
            {matchedSkills.length === 0 && <span className="text-xs text-muted">None</span>}
            {matchedSkills.map((s) => <span key={s} className="badge badge-accent">{s}</span>)}
          </div>
        </div>
        <div>
          <p className="text-xs" style={{ fontWeight: 600, color: "var(--muted)", marginBottom: 8 }}>Missing skills</p>
          <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
            {missingSkills.length === 0 && <span className="text-xs text-muted">None</span>}
            {missingSkills.map((s) => <span key={s} className="badge badge-danger">{s}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}