import pdfParse from "pdf-parse";

// Extracts raw text from an uploaded PDF resume BEFORE forwarding to n8n.
// Useful if you want the backend to validate/clean text rather than sending
// the raw binary every time (n8n Workflow 2 also does extraction — this is
// a local fallback / pre-check so bad PDFs fail fast with a clear error).
export const resumeParser = {
  async extractText(buffer) {
    try {
      const result = await pdfParse(buffer);
      return result.text.trim();
    } catch (err) {
      throw new Error("Could not read this PDF. It may be scanned/image-only or corrupted.");
    }
  },

  looksLikeResume(text) {
    const keywords = ["experience", "education", "skills", "project", "work"];
    const lower = text.toLowerCase();
    return keywords.some((k) => lower.includes(k));
  },
};

export default resumeParser;