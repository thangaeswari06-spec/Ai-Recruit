import { useState } from "react";
import { jobService } from "../../services/jobService";

export default function JDGenerator({ jobDraft, onGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    if (!jobDraft.title || !jobDraft.department) return setError("Fill in job title and department first.");
    setGenerating(true);
    setError(null);
    try {
      const result = await jobService.createJobWithAI(jobDraft);
      onGenerated?.(result.job);
    } catch (err) {
      setError(err.message || "AI generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="card" style={{ background: "var(--primary-light)", border: "1px solid #dce1ff" }}>
      <div className="flex items-center justify-between gap-16">
        <div>
          <p style={{ fontWeight: 600, color: "var(--primary-dark)", fontSize: 13 }}>✨ AI Job Description Generator</p>
          <p className="text-xs" style={{ color: "#3c4694", marginTop: 4 }}>
            Generates the JD, runs a bias check, then publishes automatically.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate with AI"}
        </button>
      </div>
      {error && <p className="form-error mt-8">{error}</p>}
    </div>
  );
}