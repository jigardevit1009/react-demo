# 🧠 State Management: Redux Toolkit (RTK Query) vs. React Context API

## 1. Architectural Strategy

In modern React applications, choosing the right tool for state management is critical for performance and maintainability. In **TaskTrack**, we implement a clear, decoupled hybrid approach:

| Scope | Tool Used | Rationale |
| :--- | :--- | :--- |
| **Server State & Data Caching** | **Redux Toolkit + RTK Query** | Caching, deduplication, polling, optimistic updates, and automatic cache invalidation tags. |
| **Client UI & System Streams** | **React Context API** | Low-overhead dependency injection for theme toggling and singleton WebSocket connections. |

---

## 2. Redux Toolkit & RTK Query Architecture

### Why RTK Query for Server State?
1. **Zero Boilerplate Cache Layer**: Eliminates custom `useEffect` fetch loops and manual `isLoading` / `isError` handling.
2. **Tag-Based Invalidation**: When a task is created or updated, mutations provide `invalidatesTags: ["Task"]`, causing any mounted components displaying tasks to automatically refetch in the background.

```
frontend/src/store/
├── api/
│   ├── apiSlice.ts           # Base API definition with baseUrl and prepareHeaders (JWT)
│   ├── authApiSlice.ts       # Login, Register, Forgot Password, Profile endpoints
│   ├── employeeApiSlice.ts   # Employee CRUD & pagination queries
│   ├── taskApiSlice.ts       # Task CRUD, status updates, tag invalidations
│   └── reportApiSlice.ts     # Asynchronous RabbitMQ export endpoints
├── authSlice.ts              # Synchronous client auth state (token & user in localStorage)
├── hooks.ts                  # Type-safe useAppDispatch and useAppSelector
└── store.ts                  # Configured Redux root store
```

### Authentication Header Injection (`frontend/src/store/api/apiSlice.ts`)
All RTK Query endpoints automatically inject the active JWT Bearer token:

```typescript
prepareHeaders: (headers, { getState }) => {
  const token = (getState() as RootState).auth.token;
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return headers;
}
```

---

## 3. React Context API Architecture

React Context is used exclusively for global concerns that do not require complex caching or data normalization:

### A. Theme Context (`frontend/src/context/ThemeContext.tsx`)
- Manages Light / Dark mode preference with `localStorage` persistence.
- Toggles `.dark` class directly on the root `document.documentElement` for instant CSS theme switching with zero layout shift.

```typescript
export interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}
```

### B. Socket Context (`frontend/src/context/SocketContext.tsx`)
- Maintains a single, continuous WebSocket connection across routes.
- Dispatches live global toast notifications (`Toast.tsx`) when events are broadcast from the backend.

---

## 4. Comparison Summary

| Feature | RTK Query | Context API |
| :--- | :--- | :--- |
| **Primary Domain** | Server data (Tasks, Employees, Auth) | UI Settings (Theme) & System Stream (Sockets) |
| **Re-render Optimization** | Component-level selectors (only updates components using affected data) | Re-renders all consumers on context value change |
| **Caching & Invalidation** | Built-in via tags (`providesTags`, `invalidatesTags`) | None (must be written manually) |
| **Persistence** | Synchronized with server + memory cache | Syncs with `localStorage` (Theme preference) |
| **Payload Size** | Scales efficiently for hundreds of records | Best for small, primitive values |
