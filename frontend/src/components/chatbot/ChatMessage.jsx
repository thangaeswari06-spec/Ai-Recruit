// Renders a single chat bubble. Bot replies come back with light markdown
// (**bold**, numbered lists like "1. **Title** – text") from the copilot —
// this turns that into readable HTML instead of one flat wall of text with
// literal "**" characters showing.
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderBotText(text) {
  // Split "1. **Title** – text 2. **Title** – text" into separate list items
  // even when the model runs them together on one line.
  const withBreaks = text.replace(/(\d+)\.\s+\*\*/g, "\n$1. **").trim();
  const lines = withBreaks.split("\n").map((l) => l.trim()).filter(Boolean);

  const isListLine = (l) => /^\d+\.\s/.test(l);
  if (!lines.some(isListLine)) {
    return <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{renderInline(text)}</p>;
  }

  const intro = [];
  const items = [];
  for (const line of lines) {
    if (isListLine(line)) items.push(line.replace(/^\d+\.\s/, ""));
    else intro.push(line);
  }

  return (
    <>
      {intro.length > 0 && (
        <p style={{ margin: "0 0 8px 0" }}>{renderInline(intro.join(" "))}</p>
      )}
      {items.length > 0 && (
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {items.map((item, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{renderInline(item)}</li>
          ))}
        </ol>
      )}
    </>
  );
}

export default function ChatMessage({ role, text }) {
  return (
    <div className={`chat-bubble ${role}`}>
      {role === "bot" ? renderBotText(text || "") : <span>{text}</span>}
    </div>
  );
}