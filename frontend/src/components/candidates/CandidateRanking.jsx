import { Link } from "react-router-dom";
import { getInitials } from "../../utils/helpers";
import SignalMeter from "../common/SignalMeter";

const STAGE_CLASS = { applied: "badge-primary", screened: "badge-primary", shortlisted: "badge-warn", interview_scheduled: "badge-warn", interviewed: "badge-primary", hired: "badge-accent", rejected: "badge-danger" };

export default function CandidateRanking({ applications = [] }) {
  const ranked = [...applications].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead style={{ background: "var(--paper)" }}>
          <tr>
            {["Rank", "Candidate", "Job", "Stage", "AI signal"].map((h, i) => (
              <th key={h} style={{ textAlign: i === 4 ? "right" : "left", padding: "12px 16px", fontSize: 10.5, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "var(--font-mono)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ranked.map((app, i) => (
            <tr key={app.id} style={{ borderTop: "1px solid #f0f1f5" }}>
              <td style={{ padding: "12px 16px" }}>
                <span className={`rank-badge${i === 0 ? " top" : ""}`}>#{i + 1}</span>
              </td>
              <td style={{ padding: "12px 16px" }}>
                <Link to={`/candidates/${app.id}`} className="flex items-center gap-12">
                  <span className="avatar-circle">{getInitials(app.candidates?.name)}</span>
                  <div>
                    <p style={{ fontWeight: 600 }}>{app.candidates?.name || "—"}</p>
                    <p className="text-xs text-muted">{app.candidates?.email}</p>
                  </div>
                </Link>
              </td>
              <td style={{ padding: "12px 16px" }}>{app.jobs?.title}</td>
              <td style={{ padding: "12px 16px" }}><span className={`badge ${STAGE_CLASS[app.stage] || "badge-muted"}`}>{app.stage}</span></td>
              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                <SignalMeter score={app.score} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}