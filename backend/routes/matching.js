import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { checkRole } from "../middleware/checkRole.js";
import { n8nService } from "../services/n8nService.js";
import { logAudit } from "../services/auditLogger.js";

const router = Router();

router.post("/evaluate", verifyToken, checkRole("admin", "recruiter"), async (req, res) => {
  const { job_id } = req.body;
  if (!job_id) return res.status(400).json({ error: "job_id is required." });

  try {
    const result = await n8nService.evaluateCandidates({ job_id });
    await logAudit({ userId: req.user.id, action: "evaluate_candidates", targetTable: "jobs", targetId: job_id });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export default router;