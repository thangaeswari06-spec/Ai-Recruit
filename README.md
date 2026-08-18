# 🤖 AI Recruitment & Interview Automation System

> An intelligent, AI-assisted recruitment platform that automates and streamlines the complete hiring lifecycle — from job creation and resume processing to candidate evaluation, interview management, recruiter assistance, and hiring decisions.

---

## 📌 Overview

The **AI Recruitment & Interview Automation System** is a full-stack recruitment platform designed to reduce manual effort in the hiring process and help recruiters make faster, data-driven decisions.

The platform combines **React, Node.js, Supabase, n8n, and Mistral AI** to create an automated recruitment pipeline.

Recruiters can create jobs using AI-generated job descriptions, manage candidates, process resumes, evaluate candidate suitability, schedule interviews, interact with an AI recruiter copilot, and manage final hiring decisions from a centralized platform.

The system uses **n8n workflows** as the automation layer and **Mistral AI** for resume intelligence, embeddings, candidate scoring, and job description generation.

---

## 🎯 Project Objectives

The primary objectives of this project are to:

- Automate repetitive recruitment tasks.
- Reduce manual resume screening.
- Extract useful candidate information automatically.
- Use AI to score and rank candidates.
- Improve candidate-to-job matching.
- Automate interview-related processes.
- Provide recruiters with AI-assisted decision support.
- Centralize recruitment data and candidate management.
- Build a scalable and modular recruitment architecture.

---

# ✨ Key Features

## 🤖 AI-Powered Job Creation

Recruiters can provide basic job requirements and use AI to generate structured job descriptions.

**Capabilities:**

- Job title generation
- Role description
- Responsibilities
- Required skills
- Preferred skills
- Experience requirements
- Qualification requirements
- Job summary

---

## 📄 Intelligent Resume Processing

The system automatically processes uploaded PDF resumes.

**Resume processing includes:**

- PDF text extraction
- Candidate name extraction
- Email extraction
- Phone number extraction
- Location extraction
- Skills extraction
- Education extraction
- Experience extraction
- Resume summarization

---

## 🧠 AI Candidate Evaluation

Mistral AI analyzes candidate information and provides recruitment intelligence.

The system can:

- Evaluate candidate profiles.
- Compare candidate skills against job requirements.
- Generate candidate scores.
- Identify matching skills.
- Identify missing skills.
- Analyze experience relevance.
- Rank candidates based on suitability.

---

## 🔎 Candidate Matching & Ranking

Candidates can be evaluated against specific job requirements.

The matching system supports:

- Skill matching
- Experience matching
- Semantic similarity
- Embedding-based search
- Candidate ranking
- Shortlisting support

---

## 📊 Recruitment Pipeline

Recruiters can manage candidates throughout different stages of the hiring process.

Example pipeline:

```text
Applied
   ↓
Screening
   ↓
Shortlisted
   ↓
Interview Scheduled
   ↓
Interviewed
   ↓
Selected / Rejected
   ↓
Hired