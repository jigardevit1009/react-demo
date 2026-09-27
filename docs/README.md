# 📚 TaskTrack Architecture & Engineering Documentation

Welcome to the technical documentation directory for **TaskTrack**. This documentation details the system design, asynchronous message queuing, real-time protocols, state management, and CI/CD pipelines implemented across the monorepo.

---

## 📑 Documentation Index

### 1. 🐰 [RabbitMQ AMQP Protocol Integration](./RABBITMQ.md)
- Asynchronous task report generation using `amqplib`.
- Durable queues, channel prefetch, and non-blocking background consumer worker.
- CloudAMQP cluster configuration for production environments.

### 2. ⚡ [Socket.io Real-Time Synchronization](./SOCKET_IO.md)
- Low-latency WebSocket integration between Express server and React clients.
- Global `SocketContext` lifecycle and real-time state broadcast events.
- Live toast notification dispatcher.

### 3. 🧠 [State Management: Redux Toolkit vs. Context API](./STATE_MANAGEMENT.md)
- Why and when we use **RTK Query** vs. **Context API**.
- Server state caching, optimistic updates, and tag-based invalidation (`Task`, `Employee`).
- ThemeContext (Dark/Light mode) and SocketContext design.

### 4. 🚀 [GitHub Actions: Monorepo CI/CD & Cloud Deployment](./GITHUB_ACTIONS.md)
- Continuous Integration quality gates for React 19 frontend and Node.js backend.
- Concurrency management, TypeScript build checks, and Prisma generation.
- Production hosting configuration on **Vercel** (Frontend) and **Render** (Backend).

### 5. 🏛️ [Complete System Architecture & Data Flow Diagrams](./ARCHITECTURE_DIAGRAMS.md)
- Full-stack visual diagrams linking React, Express, Socket.io, RabbitMQ, and PostgreSQL.
- Real-Time WebSocket stream vs. Asynchronous AMQP queue division.
- Monorepo CI/CD pipeline flow to Vercel and Render.
