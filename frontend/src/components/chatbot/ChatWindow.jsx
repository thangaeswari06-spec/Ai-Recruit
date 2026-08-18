import { useEffect, useRef, useState } from "react";
import { chatbotService } from "../../services/chatbotService";
import ChatMessage from "./ChatMessage";

export default function ChatWindow() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! Ask me about candidates, roles, or hiring decisions." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const reply = await chatbotService.sendMessage(text);
      setMessages((m) => [...m, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "error", text: err.message }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="chat-window animate-in">
          <div className="chat-header">
            <span>AI Recruitment Copilot</span>
            <button className="icon-btn" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} text={m.text} />
            ))}
            {sending && <div className="chat-bubble bot">Typing…</div>}
          </div>
          <div className="chat-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask the copilot…"
            />
            <button className="btn btn-primary btn-sm" onClick={handleSend} disabled={sending}>Send</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((v) => !v)} aria-label="Open chat">💬</button>
    </>
  );
}