import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";
import candidatesRoutes from "./routes/candidates.js";
import resumeRoutes from "./routes/resume.js";
import matchingRoutes from "./routes/matching.js";
import interviewRoutes from "./routes/interview.js";
import chatbotRoutes from "./routes/chatbot.js";
import documentsRoutes from "./routes/documents.js";
import adminRoutes from "./routes/admin.js";
import searchRoutes from "./routes/search.js";

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/candidates", candidatesRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
console.log("Server file loaded")