# 🚀 TaskTrack — Enterprise Task & Employee Management Dashboard

A modern, high-performance Full-Stack Monorepo Web Application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit (RTK Query)**, **Context API**, **Node.js Express**, **Prisma ORM**, **PostgreSQL (Supabase)**, **RabbitMQ (AMQP Protocol)**, **Socket.io**, and **GitHub Actions CI/CD**.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Tech Stack & Dependencies](#-tech-stack--dependencies)
3. [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
4. [Frontend Code Organization](#-frontend-code-organization)
5. [Recent Changes (Frontend Cleanup)](#-recent-changes-frontend-cleanup)
6. [Deep-Dive Technical Documentation](#-deep-dive-technical-documentation)
7. [Real-Time WebSocket & Socket.io](#-real-time-websocket--socketio)
8. [RabbitMQ AMQP Message Queue](#-rabbitmq-amqp-message-queue)
9. [State Management: Redux vs. Context API](#-state-management-redux-vs-context-api)
10. [GitHub Actions CI/CD & Cloud Hosting](#-github-actions-cicd--cloud-hosting)
11. [API Endpoints Reference](#-api-endpoints-reference)
12. [Getting Started & Local Setup](#-getting-started--local-setup)

---

## 🌟 Key Features

* 🔐 **Type-Safe JWT Authentication:** Strict database-backed authentication with bcrypt password hashing, signed JWT tokens, profile management, and password update/reset flows.
* 🛡️ **Role-Based Protected Routes:** Route guarding via Redux auth state, checking user roles and admin permissions with persistent `localStorage` synchronization.
* ⚡ **Real-Time Synchronization (Socket.io):** Bidirectional WebSocket communication streaming live task changes, deletion events, and toast alerts across all connected clients without polling.
* 🐰 **Asynchronous AMQP Message Queue (RabbitMQ):** Offloads heavy task report generation and CSV exports to background workers via RabbitMQ and CloudAMQP over the AMQP protocol.
* 📄 **High-Speed Chunk Pagination:** Reusable pagination component managing server-side range queries across datasets with instant navigation.
* 🔍 **Debounced Search Optimization:** Custom `useDebounce` hook (400ms delay) buffering keystrokes and reducing server traffic by ~85%.
* 🧠 **Hybrid State Architecture:** Combines Redux Toolkit (RTK Query) for cached server data with React Context API for themes and WebSocket connections.
* 🌓 **Dynamic Theme Switching:** Context API with persistent Dark / Light mode toggling and Tailwind CSS v4 dark variant styling.
* 🚀 **Automated Monorepo CI/CD:** GitHub Actions pipeline running strict TypeScript checks, Prisma client generation, and production builds before deploying to **Vercel** (Frontend) and **Render** (Backend).

---

## 📦 Tech Stack & Dependencies

### Frontend (`frontend/`)
| Technology | Version | Purpose & Architecture Rationale |
| :--- | :--- | :--- |
| **`react`** | `^19.2.8` | Core UI library with modern Hooks and Concurrent Features. |
| **`typescript`** | `^5.7.2` | Full static type safety across components, store, and utilities. |
| **`@reduxjs/toolkit`** | `^2.12.0` | Global state management and RTK Query for server state caching. |
| **`react-redux`** | `^9.3.0` | Official React bindings for Redux store integration. |
| **`react-router-dom`** | `^7.18.2` | Client-side routing, protected routes, and layout wrappers. |
| **`socket.io-client`** | `^4.8.3` | Real-time WebSocket client for live event subscriptions. |
| **`lucide-react`** | `^1.33.0` | High-quality, modern SVG vector icons. |
| **`tailwindcss`** | `^4.3.3` | Utility-first CSS styling engine with custom dark mode variants. |
| **`vite`** | `^8.2.2` | Lightning-fast bundler and local development server with HMR. |

### Backend (`backend/`)
| Technology | Version | Purpose & Architecture Rationale |
| :--- | :--- | :--- |
| **`express`** | `^4.21.2` | Fast, minimalist REST API framework for Node.js. |
| **`typescript`** | `^7.0.2` | End-to-end typed controllers, services, DTOs, and middleware. |
| **`@prisma/client`** | `^5.22.0` | Type-safe ORM connecting to PostgreSQL (Supabase). |
| **`amqplib`** | `^2.0.1` | Official Node.js driver for RabbitMQ (AMQP 0-9-1 protocol). |
| **`socket.io`** | `^4.8.3` | Real-time WebSocket server integrated into the Express HTTP server. |
| **`jsonwebtoken`** | `^9.0.3` | Cryptographic JWT token signing and verification. |
| **`bcryptjs`** | `^3.0.3` | Secure password hashing with standard salt rounds. |
| **`cors`** | `^2.8.5` | Configured Cross-Origin Resource Sharing. |
| **`dotenv`** | `^16.6.1` | Environment variable management. |

---

## 🏛️ Architecture & Monorepo Structure

```text
React-Demo/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD for Frontend & Backend
├── .gitignore                   # Master Monorepo Git ignore
├── docs/                        # In-depth architectural & technical documentation
│   ├── README.md                # Documentation index
│   ├── RABBITMQ.md              # RabbitMQ AMQP message queue architecture
│   ├── SOCKET_IO.md             # Real-time WebSocket & Socket.io integration
│   ├── STATE_MANAGEMENT.md      # Redux Toolkit vs. Context API analysis
│   └── GITHUB_ACTIONS.md        # CI/CD and Vercel/Render deployment guide
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Prisma models (Employee, Task, Enums)
│   ├── src/
│   │   ├── common/              # AppError class & BaseController
│   │   ├── config/              # Prisma client & RabbitMQ AMQP connection
│   │   ├── middleware/          # JWT authMiddleware & error handler
│   │   ├── modules/
│   │   │   ├── auth/            # Auth Controller, Service, Routes, Types
│   │   │   ├── employees/       # Employee Controller, Service, Types
│   │   │   ├── tasks/           # Task Controller, Service, Types
│   │   │   └── reports/         # RabbitMQ Producer, Worker, Controller, Routes
│   │   ├── utils/               # Password hash utility & Database seeder
│   │   └── server.ts            # Express + Socket.io HTTP server entry point
│   ├── .env.example             # Safe environment template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/          # Generic reusable UI (see "Frontend Code Organization")
    │   │   ├── layout/          # MainLayout, Navbar, Sidebar, AuthLayout
    │   │   └── tasks/           # TaskTable — shared by Dashboard & Tasks pages
    │   ├── context/             # ThemeContext (Dark/Light) & SocketContext (WebSocket)
    │   ├── hooks/               # useDebounce, useTaskActions, useExportReport
    │   ├── pages/
    │   │   ├── Dashboard/
    │   │   │   ├── DashboardPage.tsx
    │   │   │   └── components/  # DashboardMetrics, MetricCard, StatusFilterTabs
    │   │   ├── Employees/
    │   │   │   ├── EmployeesPage.tsx, EmployeeDetailPage.tsx
    │   │   │   └── components/  # EmployeeTable, EmployeeFormModal
    │   │   ├── Tasks/
    │   │   │   ├── TasksPage.tsx, TaskDetailPage.tsx
    │   │   │   └── components/  # TaskFilterBar, TaskFormModal
    │   │   ├── Profile/
    │   │   │   ├── ProfilePage.tsx
    │   │   │   └── components/  # ProfileHero, ProfileTabs, ProfileInfoForm, ChangePasswordForm
    │   │   └── Login/           # LoginPage, RegisterPage, ForgotPasswordPage
    │   ├── store/
    │   │   ├── api/             # RTK Query API slices (auth, employee, task, report)
    │   │   ├── authSlice.ts     # Client auth state & localStorage token sync
    │   │   └── store.ts         # Redux Toolkit root store
    │   ├── utils/               # validation, task, employee, date, error, variants
    │   ├── App.tsx              # React 19 router & code-split routes
    │   └── main.tsx             # Root bootstrap with Redux, Theme, & Socket providers
    ├── vercel.json              # Vercel SPA client rewrite routing
    ├── .env.example             # Frontend environment template
    └── package.json
```

---

## 🧩 Frontend Code Organization

### Where does a component go?

| Location | Put it here when… | Examples |
| :--- | :--- | :--- |
| `components/common/` | Generic UI with **no business logic**, usable on any page | `Button`, `FormInput`, `SearchInput`, `Alert` |
| `components/layout/` | Page shells and app chrome | `MainLayout`, `Navbar`, `AuthLayout` |
| `components/<feature>/` | A feature component used by **more than one page** | `components/tasks/TaskTable` |
| `pages/<Page>/components/` | A component used by **only that page** | `pages/Profile/components/ChangePasswordForm` |
| `hooks/` | Reusable stateful logic (API calls, actions) | `useTaskActions`, `useExportReport` |
| `utils/` | Pure helper functions (no React) | `isTaskCompleted`, `validateTitle` |

### Conventions
* **Keep every file under 300 lines.** If a page grows past that, move sections into its `components/` folder.
* **Don't hand-write inputs, alerts or loading states** — use the shared components below so styling stays consistent.
* **Validate on the client with `utils/validation.ts`** — sanitize while typing (`sanitizeText`, `removeWhitespace`) and validate on submit (`validateName`, `validateEmail`, `validateTitle`, `validatePasswordPair`).
* **Don't expose infrastructure in the UI.** Notification and button text should describe what the user gets ("Report Export Started"), not how it works internally.

### Reusable components (`components/common/`)

| Component | Use for |
| :--- | :--- |
| `FormInput` | Text / email / date input with label, optional left icon, error and hint |
| `PasswordInput` | Password field with lock icon and show/hide toggle (blocks spaces) |
| `NewPasswordFields` | New + confirm password pair with strength meter |
| `FormSelect` | Labeled dropdown, or a compact filter dropdown when no label is given |
| `FormField` | Shared label / error / input styles used by the three components above |
| `FormActions` | Cancel + Submit button row at the bottom of forms and modals |
| `SearchInput` | Search box with icon and clear button (blocks leading / double spaces) |
| `IconButton` | Icon-only table action with tooltip (`primary`, `success`, `danger` tones) |
| `Alert` | Inline success / error message box |
| `DataState` | `LoadingState`, `ErrorState`, `EmptyState` for tables and detail pages |
| `PageHeader` | Page title row with optional badges and action buttons |
| `Card` | Content card; `headerActions` puts filters/controls beside the title |

### Shared hooks & helpers

| Name | Purpose |
| :--- | :--- |
| `hooks/useTaskActions` | Toggle task done/undo + remove-with-confirmation, used by Dashboard & Tasks |
| `hooks/useExportReport` | Starts a background export and shows the start / failure notifications |
| `utils/task.ts` | `isTaskCompleted`, `normalizeStatus`, `toTaskList` (handles both API response shapes) |
| `utils/employee.ts` | `toEmployeeList` |

---

## 📝 Recent Changes (Frontend Cleanup)

**Form validation**
* Whitespace handling on every form: no leading / repeated spaces in text fields, no spaces at all in email and password fields; values are trimmed before submit.
* Stricter rules: names allow letters and `. ' -` only; task titles and roles must contain letters (e.g. `23424@#2342424` is rejected) and only common punctuation.
* Clear, descriptive placeholders on all inputs.

**UI**
* Removed internal details from the UI: "Socket.IO Live" badge, "Syncing..." badges, Refresh buttons, and RabbitMQ / AMQP wording in export notifications (frontend and backend).
* Content now uses the full page width (removed the fixed max-width on the layout and Profile page).
* Filters and search moved into the table card header on Dashboard, Tasks and Employees to save vertical space.
* Table actions are icon-only (✓ / ↶, ✎, 🗑) with hover tooltips.
* Profile and Change Password forms use the same 3-column grid.

**Code structure**
* Split `TasksPage` (393 → 211 lines), `DashboardPage` (365 → 125) and `ProfilePage` (361 → 22) into page-level `components/`.
* Extracted the reusable components, hooks and helpers listed above; removed duplicate code (12 hand-written inputs, 7 alert boxes, 5 loading/empty states, 2 task tables).
* Moved `MetricCard` into `pages/Dashboard/components/`; removed the unused `Header` and `EmployeeFilterBar` components.

---

## 📖 Deep-Dive Technical Documentation

Detailed documentation guides are available in the [`docs/`](./docs) folder:

* 🐰 **[RabbitMQ AMQP Integration Guide](./docs/RABBITMQ.md)**: Asynchronous task report generation, durable queues, channel prefetch, and background consumer worker.
* ⚡ **[Socket.io Real-Time Integration Guide](./docs/SOCKET_IO.md)**: WebSocket setup, live server broadcasts, client-side SocketContext, and toast notification pipeline.
* 🧠 **[State Management Guide: Redux vs. Context API](./docs/STATE_MANAGEMENT.md)**: Architectural comparison, server cache invalidation tags, and client UI state division.
* 🚀 **[GitHub Actions CI/CD & Deployment Guide](./docs/GITHUB_ACTIONS.md)**: Automated quality gates, build verification, and deployment to Vercel and Render.

---

## ⚡ Real-Time WebSocket & Socket.io

1. **Server Initialization (`backend/src/server.ts`)**: The Express app is bound to a Node HTTP server, allowing Socket.io to share port `5000` with the REST API.
2. **Global Client Context (`frontend/src/context/SocketContext.tsx`)**: The frontend maintains a single WebSocket connection that auto-reconnects on network disruption.
3. **Live State Synchronization**: When tasks are modified, the server emits `task:updated` or `task:created` events. Connected clients automatically trigger toast notifications and refresh cached views without manual reloading.

---

## 🐰 RabbitMQ AMQP Message Queue

1. **The Problem Solved**: Compiling and exporting large task reports across hundreds of records is CPU/IO intensive and can cause HTTP 504 timeouts on cloud hosts.
2. **Producer (`ReportService`)**: Generates a `jobId`, packages filter parameters into an AMQP message buffer, publishes it to the durable queue `productivity_report_queue`, and immediately returns HTTP `202 Accepted` to the client in `< 10ms`.
3. **Consumer Worker (`ReportWorker`)**: Runs in the background, fetches task records from PostgreSQL, streams them into an RFC-4180 compliant CSV, stores the file, and broadcasts a `report:ready` WebSocket event to trigger the client download.

---

## 🧠 State Management: Redux vs. Context API

| Responsibility | Technology | Why This Tool? |
| :--- | :--- | :--- |
| **Server Data Caching** | **RTK Query** | Eliminates custom fetch loops, provides automatic caching, background refetching, and tag-based invalidation (`Task`, `Employee`). |
| **Authentication State** | **Redux `authSlice`** | Manages signed JWT token, user object, and syncs directly with `localStorage`. |
| **Theme (Dark/Light)** | **Context API (`ThemeContext`)** | Simple, lightweight DOM manipulation toggling `.dark` class with zero re-rendering overhead on data components. |
| **Live WebSocket Stream** | **Context API (`SocketContext`)** | Manages a singleton socket lifecycle and exposes simple hooks (`useSocket`) for notifications across routes. |

---

## 🚀 GitHub Actions CI/CD & Cloud Hosting

Our automated CI pipeline ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) executes on every push and pull request:

* **Frontend CI**: Runs `npm ci`, verifies TypeScript types (`tsc --noEmit`), and builds the production bundle with Vite.
* **Backend CI**: Runs `npm ci`, generates the Prisma client (`prisma generate`), and compiles TypeScript.
* **Hosting**:
  * **Frontend (Vercel)**: Configured with root directory `frontend` and [`vercel.json`](./frontend/vercel.json) rewrite rules for SPA client routing.
  * **Backend (Render)**: Configured with root directory `backend`, building with `npm install && npx prisma generate && npm run build` and running `npm start`.

---

## 📡 API Endpoints Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new employee account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue signed JWT |
| `POST` | `/api/auth/forgot-password` | Public | Reset password with validation |
| `GET` | `/api/auth/me` | Protected | Get authenticated profile |
| `PUT` | `/api/auth/profile` | Protected | Update profile name and role |
| `PUT` | `/api/auth/change-password` | Protected | Change current password |

### 2. Employees (`/api/employees`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | Protected | Paginated & searchable employee list |
| `GET` | `/api/employees/:id` | Protected | Single employee profile with tasks |
| `POST` | `/api/employees` | Admin | Create employee record |
| `PUT` | `/api/employees/:id` | Admin | Update employee details |
| `DELETE` | `/api/employees/:id` | Admin | Remove employee record |

### 3. Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Protected | Paginated tasks with status/priority filtering |
| `GET` | `/api/tasks/:id` | Protected | Get single task details |
| `POST` | `/api/tasks` | Protected | Create new deliverable with assignee |
| `PUT` | `/api/tasks/:id` | Protected | Update task or toggle completion status |
| `DELETE` | `/api/tasks/:id` | Admin | Delete task deliverable |

### 4. Asynchronous Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reports/export` | Protected | Queue async CSV report generation via RabbitMQ |
| `GET` | `/api/reports/download/:jobId` | Protected | Download completed CSV export |

---

## 🛠️ Getting Started & Local Setup

### 1. Prerequisites
* **Node.js** (v20 or higher)
* **npm** (v10 or higher)
* **PostgreSQL** (Local or Supabase Cloud)
* **RabbitMQ** (Local Docker or CloudAMQP)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # Configure your DATABASE_URL, JWT_SECRET, and RABBITMQ_URL
npx prisma db push      # Push schema to database
npm run seed            # Seed initial administrator & demo records
npm run dev             # Start backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev             # Start Vite dev server on http://localhost:5173
```
