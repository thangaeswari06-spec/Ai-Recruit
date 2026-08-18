AI Recruitment System

An AI-assisted recruiting platform: recruiters post jobs, candidates apply through a public portal, resumes are parsed/scored by AI (via n8n + Mistral), and recruiters manage the pipeline through interview scheduling and hiring decisions.

Stack
Frontend: React + Vite (frontend/)
Backend: Node.js + Express (backend/)
Database / Auth / Storage: Supabase (Postgres + pgvector, Auth, Storage)
Automation / AI orchestration: n8n (3 workflows — see below)
AI: Mistral (resume parsing, embeddings, scoring, JD generation)
Project structure
ai-recruitment-system/
├── frontend/               React app (Vite)
│   └── src/
│       ├── components/     jobs, candidates, interview, candidate-portal, etc.
│       ├── services/       fetch wrappers that call the backend API
│       └── lib/             Supabase client
├── backend/                 Express API
│   ├── routes/               jobs, candidates, resume, interview, matching, etc.
│   ├── services/             n8nService, emailService, resumeParser, calendarService
│   └── middleware/           verifyToken, checkRole
└── (n8n workflow exports live outside this repo — see below)
n8n workflows

This system depends on 3 n8n workflows (exported separately as JSON, import into your n8n instance):

Workflow	Webhook path	Purpose
Workflow 1 — Job Creation	job-intelligence	AI-generated job descriptions
Workflow 2 — Candidate Processing & Scoring	resume-upload	PDF parsing, embedding, AI scoring, stores to candidates / applications
Workflow 3 — Pipeline / Interview / Hiring	evaluate-candidates, copilot-chat, hiring-decision	re-ranking, recruiter copilot chat, hiring decision flow

All 3 must be imported, credentials re-linked, and Activated (Published) in n8n before the app will work end-to-end.

Setup
1. Supabase
Create a project, enable the pgvector extension (Database → Extensions).
Create tables: jobs, candidates, applications, interviews, notes, notifications, users.
candidates.email must have a UNIQUE constraint — the n8n upsert step relies on it:
sql
  ALTER TABLE candidates ADD CONSTRAINT candidates_email_unique UNIQUE (email);
Create a public Storage bucket named resumes (Storage → New bucket → Public) so uploaded PDFs get a real resume_url.
2. Backend
bash
cd backend
npm install
cp .env.example .env   # then fill in real values, see below
npm run dev             # http://localhost:4000

Required .env values (the app will not send emails or reach n8n if any of these are missing — this bit us once, double-check the real .env file, not just .env.example):

PORT=4000
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
N8N_WEBHOOK_BASE=http://localhost:5678/webhook
FRONTEND_URL=http://localhost:5173

MISTRAL_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
3. Frontend
bash
cd frontend
npm install
cp .env.example .env   # if present, else create with values below
npm run dev             # http://localhost:5173
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:4000/api
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook
4. n8n
Import all 3 workflow JSON files.
Re-link the Postgres credential and the Mistral (HTTP Header Auth) credential on every node that needs them (import does not carry credentials over).
For the resume Storage-upload step, create an HTTP Header Auth credential (apikey = your Supabase service_role key) and attach it to the "Upload Resume to Storage (Supabase)" node.
Activate / Publish each workflow.
Known issues already fixed (keep this list updated)
⚠️ n8n's Save Profile + Embedding (Raw SQL) Postgres node originally ran two SQL statements in one parameterized query (UPDATE ...; INSERT ...;). Postgres doesn't allow multiple commands in a single parameterized statement — this silently failed the whole workflow, so applications never appeared in the Candidates list and never got scored. Fixed by splitting into two separate single-statement Postgres nodes.
⚠️ candidates.email had no UNIQUE constraint, so the n8n upsert step (ON CONFLICT (email)) errored on every apply. Fixed by adding the constraint (see SQL above).
⚠️ backend/.env was missing all SMTP_* variables (only present in .env.example), so interview-confirmation emails failed silently. Always confirm the real .env, not just .env.example, has these set.
⚠️ The resume PDF was never actually uploaded anywhere — resume_url stayed empty for every real application. Fixed by adding a Storage-upload step in Workflow 2.
⚠️ location was never requested from the AI resume parser, so it was always empty for real applications. Fixed by adding it to the extraction prompt.
⚠️ frontend/src/components/chatbot/ChatMessage.jsx was a broken/incomplete file (no real component), so copilot chat replies rendered as one unformatted block with literal ** markers. Fixed with a proper component that renders bold text and numbered lists.
Security notes
Never commit .env files — see .gitignore. Only .env.example (with placeholder values) should be committed.
If real keys were ever committed to git history, rotate them (Supabase service key, Mistral API key, Google client secret, Gmail app password) even after removing them from the working tree — git history still has them.
The Supabase service key bypasses Row Level Security — it should only ever live in backend/.env and n8n credentials, never in frontend code.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# AI Recruitment System

## Setup
1. `npm install`
2. `npm run dev` → opens at http://localhost:5173
3. Set your n8n webhook base URL in `src/config/config.js`
4. Uncomment the `api.xxx()` calls in each page/component once your
   n8n workflows are live (see N8N_WORKFLOWS.md if you have it, or
   ask for it again).

## Pages
- Sign In → src/pages/SignIn.jsx
- Dashboard → src/pages/Dashboard.jsx
- Create Job → src/pages/CreateJob.jsx
- Candidates → src/pages/Candidates.jsx
- Interview → src/pages/Interview.jsx

Auth session is kept in `localStorage` (`airecruit_user`, `airecruit_token`).