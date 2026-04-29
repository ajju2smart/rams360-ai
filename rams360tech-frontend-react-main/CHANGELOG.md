# CHANGELOG — RAMS360 Frontend

All notable changes are documented here.
Format: `type(scope): description` — atomic, reversible commits only.

---

## [Unreleased]

### 2026-04-30

#### chore(infra): strip all external URL references from Api.js
- Removed hardcoded Heroku (`rams360server-86d8d55cead8.herokuapp.com`) and production (`api.rams360tech.com`) fallback URLs
- Added `console.error` guard when `REACT_APP_API_URL` is not set at build time
- Fallback is now `http://localhost:8000` — always local Docker, never production

#### chore(infra): neutralize orphaned root env file
- `env` file at workspace root was pointing to Atlas cloud MongoDB
- Replaced with warning comment — it is NOT read by docker-compose
- docker-compose.yml remains the single source of truth for all env vars

#### chore(infra): tombstone deploy.yml
- `deploy.yml` was an empty file with potential CI/CD trigger risk
- Replaced with explicit deprecation notice

#### fix(css): remove modal margin-offset hacks
- `User.scss`: removed `margin: 5% 10% 10% 15%`, `10% 15% 15% 20%`, `17% 10% 0% 40%` from modal classes
- `frp.scss`: removed `margin: 0% 10% 0% 20%` from `.pbs-modal`, `margin: 0% 0% 0% 30%` from `.main-modal-pbs`
- `ProjectList.scss`: removed `margin: 17% 10% 0% 34%` from `.project-delete-modal-user`
- Bootstrap flex centering now handles modal positioning correctly

#### fix(css): remove button centering margin hacks in FMECA.scss
- Removed `margin-left: 30%` from `.fmeca-button`, `35%` from `.ok-buttons`, `40%` from `.buttons`
- Added `.fmeca-button-row` flex utility class (`justify-content: flex-end`)

#### feat(core): add unified Button component
- Created `src/components/core/Button.jsx` + `Button.scss`
- 4 variants: `primary` (teal), `secondary` (outlined), `danger` (red), `ghost`
- 3 sizes: `sm`, `md` (default), `lg`
- Built-in loading state with spinner + disabled state
- Uses CSS variables: `--primary-color`, `--primary-dark`
- Replaces: `save-btn`, `delete-cancel-btn`, `pro-cancel-btn`, `pbs-add-btn`, `FRP-button`

---

## [8647045] — 2026-04-29
- chore(infra): remove all Heroku/Vercel references, standardize to local Docker only

## [4827960] — 2026-04-29
- style(tokens): migrate hardcoded hex values to CSS design tokens

## [52b6775] — 2026-04-29
- feat: AI chatbot recovery + design token system
