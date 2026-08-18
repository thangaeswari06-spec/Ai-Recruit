import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { candidateService } from "../../services/candidateService";
import { timeAgo } from "../../utils/helpers";

export default function NotesAndTags({ applicationId, initialNotes = [] }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState(initialNotes);
  const [text, setText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await candidateService.addNote(applicationId, { note: text.trim(), tags });
      setNotes((n) => [{ note: text.trim(), tags, created_at: new Date().toISOString() }, ...n]);
      setText(""); setTags([]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <p className="card-title">Notes & tags</p>
      <textarea className="form-textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a note about this candidate…" />
      <div className="flex gap-8 mt-8" style={{ flexWrap: "wrap", marginBottom: 8 }}>
        {tags.map((t) => (
          <span key={t} className="badge badge-muted">{t} <button onClick={() => setTags(tags.filter((x) => x !== t))} style={{ background: "none", border: "none", marginLeft: 4 }}>×</button></span>
        ))}
        <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="+ tag" style={{ border: "none", outline: "none", width: 70, fontSize: 12 }} />
      </div>
      <button className="btn btn-dark btn-sm" onClick={handleSubmit} disabled={submitting || !text.trim()}>{submitting ? "Saving…" : "Add note"}</button>

      <div className="mt-24" style={{ maxHeight: 240, overflowY: "auto" }}>
        {notes.length === 0 && <p className="text-xs text-muted">No notes yet.</p>}
        {notes.map((n, i) => (
          <div key={n.id || i} style={{ borderBottom: "1px solid #f4f4f7", padding: "10px 0" }}>
            <p className="text-sm">{n.note}</p>
            <div className="flex items-center gap-8 mt-8">
              {(n.tags || []).map((t) => <span key={t} className="text-xs" style={{ background: "#f1f1f5", padding: "2px 6px", borderRadius: 8 }}>{t}</span>)}
              <span className="text-xs text-muted" style={{ marginLeft: "auto" }}>{timeAgo(n.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}