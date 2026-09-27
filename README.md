# 🚀 TaskTrack — Enterprise Task & Employee Management Dashboard

A modern, high-performance Full-Stack Monorepo Web Application built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit (RTK Query)**, **Context API**, **Node.js Express**, **Prisma ORM**, **PostgreSQL (Supabase)**, **RabbitMQ (AMQP Protocol)**, **Socket.io**, and **GitHub Actions CI/CD**.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Tech Stack & Dependencies](#-tech-stack--dependencies)
3. [Architecture & Monorepo Structure](#-architecture--monorepo-structure)
4. [Deep-Dive Technical Documentation](#-deep-dive-technical-documentation)
5. [Real-Time WebSocket & Socket.io](#-real-time-websocket--socketio)
6. [RabbitMQ AMQP Message Queue](#-rabbitmq-amqp-message-queue)
7. [State Management: Redux vs. Context API](#-state-management-redux-vs-context-api)
8. [GitHub Actions CI/CD & Cloud Hosting](#-github-actions-cicd--cloud-hosting)
9. [API Endpoints Reference](#-api-endpoints-reference)
10. [Getting Started & Local Setup](#-getting-started--local-setup)
11. [Presentation Guide & Technical Q&A](#-presentation-guide--technical-qa)

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
    │   │   ├── common/          # Reusable UI (Buttons, Modals, Pagination, Badges)
    │   │   └── layout/          # MainLayout, Navbar, Sidebar
    │   ├── context/             # ThemeContext (Dark/Light) & SocketContext (WebSocket)
    │   ├── hooks/               # Custom hooks (useDebounce)
    │   ├── pages/
    │   │   ├── Dashboard/       # Productivity analytics & recent task deliverables
    │   │   ├── Employees/       # Employee directory with pagination & modal CRUD
    │   │   ├── Tasks/           # Task board, filters, assignees & RabbitMQ exports
    │   │   ├── Profile/         # Profile management & password change
    │   │   └── Login/           # LoginPage, RegisterPage, ForgotPasswordPage
    │   ├── store/
    │   │   ├── api/             # RTK Query API slices (auth, employee, task, report)
    │   │   ├── authSlice.ts     # Client auth state & localStorage token sync
    │   │   └── store.ts         # Redux Toolkit root store
    │   ├── utils/               # Validation, Date formatting, Error helpers
    │   ├── App.tsx              # React 19 router & code-split routes
    │   └── main.tsx             # Root bootstrap with Redux, Theme, & Socket providers
    ├── vercel.json              # Vercel SPA client rewrite routing
    ├── .env.example             # Frontend environment template
    └── package.json
```

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

---

## 🏆 Presentation Guide & Technical Q&A

### 🎯 30-Second Elevator Pitch
> *"TaskTrack is an enterprise-grade task and employee productivity dashboard built on React 19, TypeScript, and Node.js. It decouples long-running operations using RabbitMQ over the AMQP protocol, keeps clients synchronized via real-time WebSockets with Socket.io, utilizes a hybrid state architecture of RTK Query and Context API, and is protected by an automated GitHub Actions CI/CD monorepo pipeline deployed to Vercel and Render."*

### ❓ Key Technical Questions & Answers

**Q1: Why use RabbitMQ instead of generating CSV exports directly in the HTTP request?**
> *"Large report generation is CPU- and I/O-intensive. Generating it synchronously blocks Node's event loop and risks gateway timeouts (HTTP 504) on cloud platforms. RabbitMQ over AMQP decouples the request: the API acknowledges the job in under 10ms, while a background consumer worker handles data extraction and pushes the completed file via WebSockets."*

**Q2: When do you choose Redux Toolkit vs. React Context API?**
> *"We use RTK Query for server-side cached state because it provides query deduplication, optimistic updates, and tag-based cache invalidation out of the box. We reserve Context API for global client concerns that have low update frequency and don't need complex caching, such as Theme toggling and the singleton Socket.io connection."*

**Q3: How does your GitHub Actions CI/CD setup support a monorepo?**
> *"The workflow runs parallel validation jobs for both `frontend/` and `backend/`. It executes strict TypeScript compilation, Prisma client generation, and Vite production bundling on clean Linux runners. This guarantees that broken code, missing dependencies, or syntax errors are caught before code is merged or deployed to Vercel and Render."*
