const STAGES = ["applied", "screened", "shortlisted", "interview_scheduled", "interviewed", "hired", "rejected"];

export default function CandidateFilters({ activeStage, onStageChange, minScore, onMinScoreChange }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="flex gap-8" style={{ flexWrap: "wrap", marginBottom: 16 }}>
        <button className={`chip${!activeStage ? " active" : ""}`} onClick={() => onStageChange(null)}>All stages</button>
        {STAGES.map((s) => (
          <button key={s} className={`chip${activeStage === s ? " active" : ""}`} onClick={() => onStageChange(s)}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-12">
        <label className="text-xs text-muted" style={{ whiteSpace: "nowrap" }}>Min. AI score: {minScore}%</label>
        <input type="range" min={0} max={100} step={5} value={minScore} onChange={(e) => onMinScoreChange(Number(e.target.value))} style={{ flex: 1 }} />
      </div>
    </div>
  );
}