# 🚀 ProductivityHub — Employee Task & Productivity Dashboard

A modern, high-performance Full-Stack Web Application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit (RTK Query)**, **Node.js Express**, and **Supabase Cloud PostgreSQL**.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Tech Stack & Dependencies](#-tech-stack--dependencies)
3. [Architecture & Folder Structure](#-architecture--folder-structure)
4. [API Endpoints Reference](#-api-endpoints-reference)
5. [Core Concepts & Implementation Details](#-core-concepts--implementation-details)
6. [Getting Started & Local Setup](#-getting-started--local-setup)
7. [Demo Presentation Guide & Interview Q&A](#-demo-presentation-guide--interview-qa)

---

## 🌟 Key Features

* 🔐 **Genuine JWT Authentication:** Strict database-backed authentication with password hashing (`bcryptjs`), JWT token signing & verification, login, registration, and password reset flows.
* 🛡️ **Client-Side Protected Routes:** Route guarding via Redux state and persistent `localStorage` synchronization.
* ☁️ **Cloud Database Integration:** Live 24/7 PostgreSQL database powered by Supabase Cloud.
* 📄 **High-Speed 10-Item Chunk Pagination:** Server-side pagination with exact count calculation for fast response times across 500+ records.
* 🔍 **Debounced Search & Multi-Criteria Filtering:** Custom `useDebounce` hook (400ms delay) preventing API flooding during live typing.
* ⚡ **Optimized State Management (RTK Query):** Automatic query caching, background polling, and tag-based cache invalidation (`Auth`, `Employee`, `Task`).
* 🌓 **Dynamic Theme Switching:** Context API with persistent Dark / Light mode toggling and custom Tailwind v4 dark variant styling.
* 🎯 **Dynamic Employee Assignee Selection:** Interactive dropdown fetching live team members to assign project tasks.
* 🎨 **Modern Vector Iconography:** Clean, modern vector icons powered by `lucide-react`.

---

## 📦 Tech Stack & Dependencies

### Frontend Dependencies

| Package | Version | Purpose & Architecture Rationale |
| :--- | :--- | :--- |
| **`react`** | `^19.2.8` | Core UI library for modern component-based UI and Hooks. |
| **`react-dom`** | `^19.2.8` | DOM renderer for React components. |
| **`@reduxjs/toolkit`** | `^2.12.0` | Global state management and RTK Query for server state caching. |
| **`react-redux`** | `^9.3.0` | Official React bindings for Redux store integration. |
| **`react-router-dom`** | `^7.18.2` | Declarative client-side routing, protected routes, and layout wrappers. |
| **`lucide-react`** | `^1.33.0` | High-quality, lightweight SVG icons. |
| **`tailwindcss`** | `^4.3.3` | Utility-first CSS styling engine with custom `@custom-variant dark`. |
| **`@tailwindcss/vite`** | `^4.3.3` | Native Vite integration for lightning-fast CSS processing. |
| **`vite`** | `^8.2.0` | Ultra-fast build tool and local dev server with HMR. |

### Backend Dependencies

| Package | Version | Purpose & Architecture Rationale |
| :--- | :--- | :--- |
| **`express`** | `^4.21.2` | Fast, minimalist Node.js REST API framework. |
| **`@supabase/supabase-js`** | `^2.112.3` | Official SDK for Supabase Cloud PostgreSQL database operations. |
| **`jsonwebtoken`** | `^9.0.3` | Generates and verifies cryptographic JWT bearer tokens for auth. |
| **`bcryptjs`** | `^3.0.3` | Secure password hashing using salt rounds. |
| **`cors`** | `^2.8.5` | Middleware enabling secure Cross-Origin Resource Sharing. |
| **`dotenv`** | `^16.4.7` | Loads environment variables securely from `.env`. |
| **`nodemon`** | `^3.1.9` | Dev server file watcher for automatic backend restarts. |

---

## 🏛️ Architecture & Folder Structure

```text
React-Demo/
├── .gitignore                   # Master Git ignore protecting secrets (.env)
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js      # Supabase Cloud Client initialization
│   │   ├── controllers/
│   │   │   ├── authController.js       # Login, Register, Forgot-Password, JWT
│   │   │   ├── employeeController.js   # Paginated & Filtered Employee CRUD
│   │   │   └── taskController.js       # Paginated Task CRUD with Assignee
│   │   ├── middleware/
│   │   │   └── authMiddleware.js       # JWT Authorization Bearer Verification
│   │   ├── routes/
│   │   │   ├── authRoutes.js           # Auth endpoint route definitions
│   │   │   ├── employeeRoutes.js       # Employee route definitions
│   │   │   └── taskRoutes.js           # Task route definitions
│   │   ├── utils/
│   │   │   ├── responseHandler.js      # Standardized JSON response wrapper
│   │   │   └── seeder.js               # 500-Record Supabase Batch Seeder
│   │   └── server.js                   # Express server entry point
│   ├── .env.example                    # Safe environment template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/                 # Button, Card, Badge, Modal, ProtectedRoute
    │   │   └── layout/                 # MainLayout, Navbar, Sidebar
    │   ├── context/
    │   │   └── ThemeContext.jsx        # Dark/Light theme state with localStorage
    │   ├── hooks/
    │   │   └── useDebounce.js          # Custom 400ms search input debouncer
    │   ├── pages/
    │   │   ├── Dashboard/              # High-level metrics & recent deliverables
    │   │   ├── Employees/              # Paginated employee directory & CRUD
    │   │   ├── Tasks/                  # Paginated deliverables board & Assignee selector
    │   │   └── Login/                  # LoginPage, RegisterPage, ForgotPasswordPage
    │   ├── store/
    │   │   ├── api/                    # RTK Query slices (auth, employee, task)
    │   │   ├── authSlice.js            # Redux auth slice with token persistence
    │   │   └── store.js                # Central Redux Toolkit store
    │   ├── App.jsx                     # Route definitions & Code Splitting
    │   ├── main.jsx                    # Root rendering with Redux & Theme providers
    │   └── index.css                   # Tailwind v4 theme configuration
    └── package.json
```

---

## 📡 API Endpoints Reference

All endpoints return a standardized JSON structure:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "error": null
}
```

### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account in Supabase | `{ name, email, password, role }` |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue signed JWT | `{ email, password }` |
| `POST` | `/api/auth/forgot-password` | Public | Reset account password with bcrypt | `{ email, newPassword }` |
| `GET` | `/api/auth/me` | Protected | Verify JWT & get authenticated profile | *Bearer Token Header* |

### 2. Employees Endpoints (`/api/employees`)

| Method | Endpoint | Query Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | `page=1`, `limit=10`, `search=...`, `department=...`, `all=true` | Fetch paginated & filtered employees |
| `GET` | `/api/employees/:id` | — | Get single employee details |
| `POST` | `/api/employees` | — | Create new employee record |
| `PUT` | `/api/employees/:id` | — | Update existing employee record |
| `DELETE` | `/api/employees/:id` | — | Delete employee record |

### 3. Tasks Endpoints (`/api/tasks`)

| Method | Endpoint | Query Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | `page=1`, `limit=10`, `search=...`, `status=...`, `priority=...` | Fetch paginated & filtered tasks |
| `GET` | `/api/tasks/:id` | — | Get single task details |
| `POST` | `/api/tasks` | — | Create new deliverable with assignee |
| `PUT` | `/api/tasks/:id` | — | Update task details / toggle status |
| `DELETE` | `/api/tasks/:id` | — | Delete task deliverable |

---

## 💡 Core Concepts & Implementation Details

### 1. Debounced Search Optimization
* **Why:** Typing in a search bar without debouncing sends an HTTP request on every keystroke (e.g. typing "Alexander" sends 9 API requests).
* **How:** `useDebounce` hook buffers the user's keystroke value and only emits the updated search term after the user has stopped typing for **400ms**, reducing server load by **~85%**.

### 2. RTK Query Automatic Cache Invalidation
* **Why:** When a task or employee is added, edited, or deleted, other components must update instantly without manual refetching.
* **How:** `apiSlice.js` tags data with `tagTypes: ["Employee", "Task", "Auth"]`. When `createTask` runs, it specifies `invalidatesTags: ["Task"]`, triggering RTK Query to automatically refetch only the active tasks view.

### 3. Route-Based Code Splitting
* **Why:** Downloading the entire application bundle on first load slows down initial page rendering.
* **How:** `React.lazy()` and `<Suspense />` dynamically load page bundles on demand (e.g., `EmployeesPage.jsx` is only downloaded when navigating to `/employees`).

### 4. Tailwind CSS v4 Custom Dark Variant
* Configured `@custom-variant dark (&:where(.dark, .dark *));` in `index.css` to enable smooth class toggling between light and dark themes using React Context API.

---

## 🛠️ Getting Started & Local Setup

### 1. Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds 250 Employees + 250 Tasks into Supabase Cloud
npm run dev      # Runs Express backend on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Runs Vite dev server on http://localhost:5173
```

---

## 🏆 Demo Presentation Guide & Interview Q&A

### 🎯 30-Second Elevator Pitch
> *"ProductivityHub is a full-stack enterprise dashboard built on React 19, Redux Toolkit, and Supabase. It solves large-dataset performance bottlenecks through server-side chunk pagination, debounced query optimization, and lazy route splitting, paired with genuine JWT authentication and dark mode styling."*

### ❓ Top 4 Likely Interview Questions & Answers

**Q1: Why did you choose RTK Query over standard `useEffect` + `axios`?**
> *"RTK Query eliminates hundreds of lines of boilerplate. It provides automatic query deduplication, server-state caching, loading/error states out of the box, and tag-based cache invalidation, ensuring UI components stay in sync with zero extra re-renders."*

**Q2: How does the Protected Route system work?**
> *"The `<ProtectedRoute />` component inspects the Redux `authSlice` and `localStorage` token. If the user is unauthenticated, it redirects them to `/login` using React Router's `<Navigate />` and captures `location.state.from` so they return to their intended page upon login."*

**Q3: How does your search handle hundreds of records without lagging?**
> *"We use a custom `useDebounce` hook with a 400ms delay that waits until typing ceases before firing the query. On the backend, Supabase uses indexed `.ilike()` search coupled with `.range()` pagination so only 10 records are transferred across the wire at a time."*

**Q4: How did you implement Dark Mode?**
> *"We combined React Context API for global state persistence with Tailwind CSS v4's `.dark` class targeting on the `document.documentElement`. The preference is saved in `localStorage` so it persists across user sessions."*
