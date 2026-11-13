# TaskTrack — Frontend

React 19 + TypeScript + Vite + Tailwind CSS v4 + Redux Toolkit (RTK Query).

> 📘 **Full project documentation lives in the [root README](../README.md)** — tech stack, monorepo structure, API reference, backend setup and deployment.

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env    # set the backend API URL
npm run dev             # http://localhost:5173
```

The backend must be running for login and data to work — see [Getting Started](../README.md#-getting-started--local-setup).

## Scripts

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check, then production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npx tsc --noEmit` | Type-check the whole project (also runs in CI) |

## Where things go

```text
src/
├── components/
│   ├── common/      # Generic reusable UI (FormInput, SearchInput, IconButton, Alert, ...)
│   ├── layout/      # MainLayout, Navbar, Sidebar, AuthLayout
│   └── tasks/       # TaskTable (shared by Dashboard & Tasks)
├── context/         # ThemeContext, SocketContext
├── hooks/           # useDebounce, useTaskActions, useExportReport
├── pages/<Page>/    # Page file + components/ used only by that page
├── store/           # Redux store, authSlice, RTK Query api/ slices
└── utils/           # validation, task, employee, date, error helpers
```

Rules of thumb:
* Keep files **under 300 lines** — split large pages into `pages/<Page>/components/`.
* Use the shared form components and `utils/validation.ts` instead of hand-written inputs.
* Don't show internal infrastructure (queues, sockets) in user-facing text.

👉 Full component reference and conventions: [Frontend Code Organization](../README.md#-frontend-code-organization)
