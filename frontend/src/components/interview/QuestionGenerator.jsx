export default function QuestionGenerator({ questions, generating }) {
  const list = (questions || "").split("\n").filter(Boolean);
  if (generating) return <div className="card" style={{ background: "var(--primary-light)", fontSize: 13, color: "var(--primary-dark)" }}>✨ AI is generating interview questions…</div>;
  if (!questions) return null;
  return (
    <div className="card">
      <p className="card-title">AI-generated questions</p>
      <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.8 }}>
        {list.map((q, i) => <li key={i}>{q.replace(/^\d+[\.\)]\s*/, "")}</li>)}
      </ol>
    </div>
  );
}