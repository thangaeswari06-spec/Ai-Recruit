import { useState } from "react";
import { interviewService } from "../../services/interviewService";

const RECOMMENDATIONS = ["Strong Hire", "Hire", "No Hire", "Strong No Hire"];

export default function FeedbackForm({ interview, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating || !recommendation) return setError("Give a rating and recommendation.");
    setSubmitting(true);
    setError(null);
    try {
      await interviewService.submitFeedback(interview.id, { rating, feedback, recommendation });
      onSubmitted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Rating</label>
        <div className="flex gap-8">
          {[1, 2, 3, 4, 5].map((r) => (
            <button key={r} type="button" onClick={() => setRating(r)} style={{ background: "none", border: "none", fontSize: 22, color: r <= rating ? "var(--warn)" : "#e4e4ec" }}>★</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Recommendation</label>
        <div className="form-row">
          {RECOMMENDATIONS.map((r) => (
            <button key={r} type="button" onClick={() => setRecommendation(r)} className={`chip${recommendation === r ? " active" : ""}`} style={{ marginBottom: 8 }}>{r}</button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Feedback notes</label>
        <textarea className="form-textarea" rows={5} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Strengths, concerns…" />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>{submitting ? "Saving…" : "Submit feedback"}</button>
    </form>
  );
}