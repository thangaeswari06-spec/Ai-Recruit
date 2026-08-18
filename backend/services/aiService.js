import fetch from "node-fetch";

// Direct AI call helper — used for quick inline operations that don't need
// a full n8n workflow (e.g. a one-off summarization). Heavy lifting (JD gen,
// resume scoring, reranking, copilot chat) stays in n8n workflows, which also
// call Mistral — so the whole system now talks to a single AI provider.
const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

export const aiService = {
  async complete({ system, prompt, temperature = 0.4, model = "mistral-small-latest" }) {
    const res = await fetch(MISTRAL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI completion failed: ${text}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  },

  // Quick helper for short summaries (e.g. note summarization) without going through n8n
  async summarize(text, maxSentences = 3) {
    return this.complete({
      system: `Summarize the following in at most ${maxSentences} sentences. Plain text, no markdown.`,
      prompt: text,
    });
  },
};

export default aiService;