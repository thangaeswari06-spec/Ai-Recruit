import { useEffect, useState } from "react";
import { interviewService } from "../../services/interviewService";
import QuestionGenerator from "./QuestionGenerator";

export default function ScheduleInterview({ application, onScheduled }) {
  const [form, setForm] = useState({ scheduled_at: "", interviewer_id: "" });
  const [interviewers, setInterviewers] = useState([]);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    interviewService
      .listInterviewers()
      .then((data) => { if (active) setInterviewers(data || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoadingInterviewers(false); });
    return () => { active = false; };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.scheduled_at) return setError("Pick a date & time.");
    if (!form.interviewer_id) return setError("Pick an interviewer.");

    const interviewer = interviewers.find((i) => i.id === form.interviewer_id);

    setSubmitting(true);
    setError(null);
    try {
      const interview = await interviewService.scheduleInterview({
        application_id: application?.id,
        interviewer_id: form.interviewer_id,
        interviewer_email: interviewer?.email,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
      });
      setResult(interview);
      onScheduled?.(interview);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <p className="card-title">Schedule interview</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Date & time</label>
          <input className="form-input" type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Interviewer</label>
          <select
            className="form-select"
            value={form.interviewer_id}
            onChange={(e) => setForm((f) => ({ ...f, interviewer_id: e.target.value }))}
            disabled={loadingInterviewers}
          >
            <option value="">{loadingInterviewers ? "Loading interviewers…" : "Select an interviewer…"}</option>
            {interviewers.map((i) => (
              <option key={i.id} value={i.id}>{i.name || i.email} ({i.role})</option>
            ))}
          </select>
          {!loadingInterviewers && interviewers.length === 0 && (
            <p className="form-hint mt-8">No interviewer accounts yet — invite one from Settings → Team.</p>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>{submitting ? "Scheduling…" : "Schedule interview"}</button>
      </form>
      {result && <div className="mt-16"><QuestionGenerator questions={result.questions} /></div>}
    </div>
  );
}
