# NFL Draft Frontend (React + Vite)

A modern, high-performance web frontend for the **2026 NFL Draft Board & Prospect Database**. Built with **React 19**, **Vite**, **TanStack Table v8**, and **TanStack Query**.

Designed with a sleek Detroit Lions glassmorphism theme (`#0076B6` Honolulu Blue + `#B0873A` Vintage Gold accents).

---

## 🚀 Quick Start (Local Development)

### 1. Start the FastAPI Backend
In your backend repository (`nfl-draft-app`):

```pwsh
# Activate conda environment and run FastAPI
conda activate nfl-draft-app-v2
uvicorn api.main:app --reload --port 8000
```
Backend API will be running at: `http://localhost:8000` (Docs: `http://localhost:8000/docs`)

### 2. Start the React Frontend
In this repository (`nfl-draft-frontend`):

```pwsh
npm install
npm run dev
```
Frontend will be available at: `http://localhost:5173`

Vite dev server is pre-configured with a reverse proxy forwarding all `/api` requests to `http://localhost:8000`.

---

## 🏗️ Project Architecture

```
nfl-draft-frontend/
├── src/
│   ├── api/
│   │   └── client.js             # Centralized API fetcher (dev proxy / prod baseUrl)
│   ├── components/
│   │   ├── AppHeader/            # Glassmorphism navigation & brand header
│   │   ├── FilterPanel/          # Position grid, tiers, status toggles, search
│   │   ├── ProspectModal/        # Scouting detail, rankings, athletic metrics & data lineage
│   │   └── ProspectTable/        # TanStack Table v8 sortable grid with rank & status badges
│   ├── hooks/
│   │   └── useProspects.js       # TanStack Query hooks (caching, auto-refresh)
│   ├── pages/
│   │   ├── Prospects.jsx         # Prospect Database view + summary KPI cards
│   │   └── Prospects.css
│   ├── utils/
│   │   └── formatting.js         # Numbers, ranks, positions, and tier formatting
│   ├── App.jsx                   # Shell layout and React Router routes
│   ├── index.css                 # Global design system & theme tokens
│   └── main.jsx
├── vite.config.js                # Vite config + dev proxy to FastAPI
└── package.json
```

---

## 🌐 Production Deployment (Vercel)

1. Push this repository to GitHub.
2. Link the repository to [Vercel](https://vercel.com).
3. Set the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the environment variable:
   - `VITE_API_URL`: Your deployed backend URL on Render (e.g. `https://nfl-draft-api.onrender.com`)
