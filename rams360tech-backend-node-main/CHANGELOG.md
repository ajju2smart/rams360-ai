# CHANGELOG — RAMS360 Backend

All notable changes are documented here.
Format: `type(scope): description` — atomic, reversible commits only.

---

## [Unreleased]

### 2026-04-30

#### fix(cors): remove production domain whitelist from app.js
- Removed `https://rams360tech.com` and `https://dev.rams360tech.com` from CORS origin list
- Local Docker-only origins retained: `http://localhost:3000`, `http://localhost:5173`
- Prevents accidental cross-origin acceptance from production browsers

---

## [8647045] — 2026-04-29
- chore(infra): remove all Heroku/Vercel references, standardize to local Docker only

## [e9ffbbc] — 2026-04-29
- refactor(reports): replace recursive tree traversal with iterative collectActiveNodes

## [52b6775] — 2026-04-29
- feat: AI chatbot recovery + design token system
