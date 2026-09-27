# 🚀 GitHub Actions: Monorepo CI/CD & Cloud Deployment Guide

## 1. Overview

**TaskTrack** is structured as a full-stack monorepo containing:
- **`frontend/`**: React 19 + TypeScript + Vite (Hosted on **Vercel**)
- **`backend/`**: Node.js + Express + Prisma + TypeScript (Hosted on **Render**)

To guarantee code quality and prevent broken builds from ever reaching production, we implemented an automated GitHub Actions workflow in `.github/workflows/ci.yml`.

---

## 2. Workflow Pipeline Architecture

```
                               git push / Pull Request
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
            Frontend CI Check                          Backend CI Check
            (ubuntu-latest)                            (ubuntu-latest)
            - npm ci                                   - npm ci
            - TypeScript check (tsc)                   - Prisma Client Generation
            - Vite bundle build                        - TypeScript compilation
                     │                                         │
                     └────────────────────┬────────────────────┘
                                          ▼
                               All Quality Gates Pass (✅)
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
             ⚡ Vercel Deployment                      🚀 Render Deployment
             - Auto-builds frontend                    - Auto-deploys via GitHub or
             - Deploys to Global CDN                     triggers Deploy Hook URL
```

---

## 3. Workflow File Breakdown (`.github/workflows/ci.yml`)

### Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
*Why this matters:* If multiple commits are pushed in rapid succession to the same branch or PR, previous running builds are cancelled immediately, saving GitHub Actions minutes and compute resources.

### Job 1: `frontend-ci`
1. Checks out repository with `actions/checkout@v4`.
2. Sets up Node.js 20 with dependency caching targeting `frontend/package-lock.json`.
3. Runs `npm ci` for fast, reproducible dependency installations.
4. Executes strict TypeScript type verification (`npx tsc --noEmit`).
5. Generates the production bundle with `npm run build` to verify tree-shaking and assets.

### Job 2: `backend-ci`
1. Sets up Node.js 20 with dependency caching targeting `backend/package-lock.json`.
2. Runs `npm ci`.
3. Executes `npx prisma generate` to construct the `@prisma/client` types from `schema.prisma`.
4. Executes `npm run build` (`tsc`) to verify type safety and emit build output.

### Job 3: `deploy-render` (Optional CD Webhook)
Runs only on commits to `main` / `master` *after* both frontend and backend quality gates succeed. If a `RENDER_DEPLOY_HOOK_URL` secret is provided in the repository, it triggers the Render deployment webhook.

---

## 4. Hosting Setup Reference

### Vercel (Frontend) Configuration
1. **Framework Preset**: `Vite`
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variable**: `VITE_API_URL = https://your-backend.onrender.com/api`

### Render (Backend) Configuration
1. **Root Directory**: `backend`
2. **Environment**: `Node`
3. **Build Command**: `npm install && npx prisma generate && npm run build`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `NODE_ENV = production`
   - `JWT_SECRET = <your_secret>`
   - `DATABASE_URL = <postgresql_pooler_url>`
   - `DIRECT_URL = <postgresql_direct_url>`
   - `RABBITMQ_URL = <cloudamqp_url>`
