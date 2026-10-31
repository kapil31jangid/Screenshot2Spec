# Screenshot2Spec — Deployment Guide

> **Repo:** https://github.com/kapil31jangid/Screenshot2Spec  
> **Latest commit:** `389ad71` on `main`  
> **Architecture:** Next.js 15 frontend (port 3000) + standalone Node.js backend (port 3001)

---

## Repository Structure

```
Screenshot2Spec/
├── frontend/          ← Next.js 15 App Router (port 3000)
│   ├── src/
│   ├── next.config.ts ← proxies /api/* → localhost:3001
│   └── package.json
├── backend/           ← Standalone Node HTTP server (port 3001)
│   ├── src/
│   │   ├── server.ts          ← entry point, auto-loads .env
│   │   ├── api/analyze/route.ts
│   │   └── lib/gemma.ts       ← Gemma 4 API client (120s timeout)
│   ├── .env.example
│   └── package.json
└── docs/              ← Audit reports, assets
```

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 20.x LTS or newer |
| npm | 10+ (bundled with Node 20) |
| Google AI Studio API key | [aistudio.google.com](https://aistudio.google.com) |

---

## 1. Local Development

### Step 1 — Clone & install

```bash
git clone https://github.com/kapil31jangid/Screenshot2Spec.git
cd Screenshot2Spec

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### Step 2 — Configure backend environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Required — get from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_real_api_key_here

# Model (default is fine)
GEMMA_MODEL=gemma-4-26b-a4b-it

# Port (optional, defaults to 3001)
BACKEND_PORT=3001
```

> [!CAUTION]
> **Never** commit `backend/.env` — it is gitignored. Never prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`; it must remain server-side only.

### Step 3 — Start backend

```bash
cd backend
npm run dev        # development (tsx watch, hot-reload)
# or
npm start          # production (tsx, no watch)
```

Verify it's up:
```bash
curl http://localhost:3001/health
# → {"status":"ok","service":"screenshot2spec-backend","port":3001}
```

### Step 4 — Start frontend

```bash
cd frontend
npm run dev        # starts on http://localhost:3000
```

The frontend proxies all `/api/*` requests → `http://localhost:3001/api/*` via `next.config.ts` rewrites. No additional environment variables are needed for the frontend in local dev.

### Step 5 — Verify end-to-end

Open `http://localhost:3000`, upload a UI screenshot (PNG/JPG/WebP, max 5 MB). Expect:

- Backend log: `[Gemma Backend] Dispatching analysis to model: models/gemma-4-26b-a4b-it`
- Response time: **30–90 seconds** for real screenshots
- Frontend: results dashboard with components, color palette, and code blueprint

---

## 2. Running Tests

```bash
# Backend unit + route tests (27 passing)
cd backend && npm test

# Live Gemma 4 integration test (requires real GEMINI_API_KEY in backend/.env)
cd backend && npm run test:live

# Frontend tests (10 passing)
cd frontend && npm test

# Frontend production build check
cd frontend && npm run build
```

---

## 3. Production Deployment

### Option A — Railway (Recommended for full-stack)

Railway can host both services from a single repo using separate services.

#### Backend service

1. New project → **Deploy from GitHub repo** → select `Screenshot2Spec`
2. Set **Root Directory** to `backend`
3. Set **Start command**: `npm start`
4. Add environment variables:
   ```
   GEMINI_API_KEY=<your key>
   GEMMA_MODEL=gemma-4-26b-a4b-it
   BACKEND_PORT=3001
   ```
5. Note the Railway-assigned public URL, e.g. `https://screenshot2spec-backend.up.railway.app`

#### Frontend service

1. Add another service in the same project → same repo
2. Set **Root Directory** to `frontend`
3. Set **Build command**: `npm run build`
4. Set **Start command**: `npm start`
5. Add environment variable:
   ```
   BACKEND_URL=https://screenshot2spec-backend.up.railway.app
   ```

> [!IMPORTANT]
> The `BACKEND_URL` env var is read by `frontend/next.config.ts` at **build time** for the rewrite destination. Set it before building.

---

### Option B — Vercel (Frontend) + Railway/Render (Backend)

#### Backend on Railway/Render

Same as Option A backend steps above.

#### Frontend on Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Framework preset: **Next.js** (auto-detected)
4. Add environment variable:
   ```
   BACKEND_URL=https://your-backend-url.railway.app
   ```
5. Deploy

> [!NOTE]
> Vercel's default function timeout is 10s on Hobby, 60s on Pro. Gemma 4 analysis takes 30–90s. **You need Vercel Pro** or a different proxy strategy for production.  
> Alternative: set `experimental.proxyTimeout` is already configured at 150s in `next.config.ts`.

---

### Option C — Netlify (Frontend) + Any Node host (Backend)

1. Netlify → **Import from Git** → `frontend/` as publish directory
2. Build command: `npm run build`
3. Add `BACKEND_URL` env var

> [!WARNING]
> Netlify Functions have a 10s timeout by default (26s on paid plans). Gemma 4 will timeout. Use Vercel Pro or self-host the frontend alongside the backend.

---

### Option D — Self-hosted VPS (Ubuntu / any Linux)

```bash
# On the server
git clone https://github.com/kapil31jangid/Screenshot2Spec.git
cd Screenshot2Spec

# Backend
cd backend
npm ci
cp .env.example .env
nano .env   # fill in GEMINI_API_KEY

# Run backend with PM2
npm install -g pm2
pm2 start "npm start" --name s2s-backend
pm2 save

# Frontend
cd ../frontend
BACKEND_URL=http://localhost:3001 npm run build
pm2 start "npm start" --name s2s-frontend
pm2 save

# (optional) Nginx reverse proxy
# Proxy port 80/443 → port 3000 for frontend
# Backend stays internal on 3001
```

---

## 4. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | — | Google AI Studio API key |
| `GEMMA_MODEL` | No | `gemma-4-26b-a4b-it` | Model ID (normalized to `models/...` prefix automatically) |
| `BACKEND_PORT` | No | `3001` | Port the standalone server listens on |
| `USE_MOCK_GEMMA` | No | `false` | Set `true` to return mock analysis (testing only) |

### Frontend (env at build/runtime)

| Variable | Required | Default | Description |
|---|---|---|---|
| `BACKEND_URL` | No (local dev) | `http://localhost:3001` | Backend base URL for Next.js API rewrites |

> [!NOTE]
> The frontend has **no** `GEMINI_API_KEY` — all AI calls go through the backend. The `BACKEND_URL` is used server-side in `next.config.ts` rewrites only.

---

## 5. Timeout Configuration

Gemma 4 analysis on real screenshots typically takes **30–90 seconds**. The following timeouts are configured to accommodate this:

| Layer | Setting | Value |
|---|---|---|
| Gemma SDK call | `DEFAULT_TIMEOUT_MS` in `gemma.ts` | **120 seconds** |
| Next.js proxy rewrite | `experimental.proxyTimeout` in `next.config.ts` | **150 seconds** |
| Browser fetch | `AbortSignal` in `useAnalysis.ts` | **130 seconds** |

If you deploy behind a load balancer or CDN, ensure its upstream timeout is also set to at least **150 seconds**.

---

## 6. Health & Monitoring

```bash
# Backend health check endpoint
GET http://localhost:3001/health
# → {"status":"ok","service":"screenshot2spec-backend","port":3001}

# Analyze endpoint (POST, multipart/form-data)
POST http://localhost:3001/api/analyze
  screenshot: <file>
  framework:  nextjs-ts
  styling:    tailwind

# Mock mode (testing without Gemma call)
POST http://localhost:3001/api/analyze?mock=true
```

---

## 7. Common Issues

| Symptom | Cause | Fix |
|---|---|---|
| `500 — Server responded with status 500` | Gemma timed out (< 120s) or proxy dropped early | Check backend logs; ensure `GEMINI_API_KEY` is set; confirm timeouts above |
| `API key not configured` | `GEMINI_API_KEY` not in `backend/.env` or env not loaded | Restart backend from `backend/` directory so `cwd()/.env` resolves |
| `Model unavailable (503)` | `GEMMA_MODEL` value not on your AI Studio account | Try `gemini-2.5-flash` as fallback in `.env` |
| `Quota exceeded (429)` | AI Studio rate limit | Wait and retry; check your AI Studio quota |
| Frontend shows mock data | Old code cached / `loadDemo` button used | Hard-refresh browser; real uploads never use mock since commit `316d753` |
| `EADDRINUSE :3001` | Old backend process still running | `Get-NetTCPConnection -LocalPort 3001 \| ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }` |

---

## 8. Git History (key commits)

| Commit | Description |
|---|---|
| `389ad71` | Fix timeouts: 120s Gemma, 150s proxy, 130s frontend |
| `316d753` | Auto-load `.env` in backend; remove silent mock fallback |
| `56d67a9` | Final platform audit docs |
| `f0e0b4d` | Configure API proxy rewrite in `next.config.ts` |
| `48c78bb` | Merge `feature/frontend` → `main` |
