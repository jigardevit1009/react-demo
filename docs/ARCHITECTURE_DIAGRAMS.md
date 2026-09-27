# 🏛️ Complete System Architecture & Data Flow

This document provides visual architectural diagrams illustrating how the entire full-stack ecosystem interacts across **React 19**, **Socket.io**, **RabbitMQ (AMQP)**, **Prisma**, **PostgreSQL**, and **GitHub Actions CI/CD**.

---

## 1. High-Level Full-Stack System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (Hosted on Vercel)"]
        UI["React 19 SPA (Vite + Tailwind v4)"]
        RTK["Redux Toolkit & RTK Query Store"]
        SC["Socket.io Client (SocketContext)"]
        TC["Theme Context (Dark/Light)"]
        
        UI <--> RTK
        UI <--> SC
        UI <--> TC
    end

    subgraph APILayer ["API & Real-Time Gateway (Hosted on Render)"]
        HTTP["Express 4 REST API Server"]
        WS["Socket.io WebSocket Server"]
        AUTH["JWT & Bcrypt Security Layer"]
        PRODUCER["Report Producer Service"]
        
        HTTP <--> AUTH
        HTTP <--> WS
        HTTP --> PRODUCER
    end

    subgraph QueueLayer ["Async Messaging Layer (CloudAMQP)"]
        AMQP["RabbitMQ Message Broker (AMQP 0-9-1)"]
        QUEUE[("Queue: productivity_report_queue<br>Durable: true")]
        
        AMQP <--> QUEUE
    end

    subgraph WorkerLayer ["Async Processing Layer (Worker Process)"]
        WORKER["Report Worker Consumer (prefetch: 1)"]
    end

    subgraph DataLayer ["Data Storage Layer (Supabase Cloud)"]
        PRISMA["Prisma ORM Client"]
        POSTGRES[("PostgreSQL 15 Database")]
        
        PRISMA <--> POSTGRES
    end

    %% Client to Server interactions
    UI -->|HTTPS REST Requests| HTTP
    SC <-->|WSS Full-Duplex WebSockets| WS

    %% Server to Infrastructure
    HTTP -->|Queries & Mutations| PRISMA
    PRODUCER -->|AMQP Persistent Messages| AMQP
    AMQP -->|Dispatches Jobs| WORKER
    WORKER -->|Queries Tasks| PRISMA
    WORKER -->|Broadcasts report:ready| WS
```

---

## 2. Real-Time Socket vs. AMQP Message Queue: Role Division

```mermaid
graph TD
    subgraph Synchronous & Real-Time Stream
        A[User Action: Task Completed] -->|REST API PUT| B[Express Server]
        B -->|Updates Database| C[(PostgreSQL)]
        B -->|Pushes Notification| D[Socket.io Hub]
        D -->|Instant WebSocket Event| E[All Active React Clients]
    end

    subgraph Asynchronous Heavy Processing
        F[User Action: Export 500+ Tasks] -->|REST API POST| G[Express Server]
        G -->|Returns 202 Accepted in 8ms| H[Client UI: Job Queued]
        G -->|AMQP Message| I[RabbitMQ Queue]
        I -->|Consumes Job| J[Background Worker]
        J -->|Queries DB & Generates CSV| C
        J -->|Triggers Completion Event| D
    end
```

---

## 3. Monorepo CI/CD & Deployment Pipeline

```mermaid
flowchart LR
    Dev[Developer git push] --> GHA[GitHub Actions Runner]

    subgraph CI Pipeline [".github/workflows/ci.yml"]
        GHA --> Job1[Job 1: Frontend CI]
        GHA --> Job2[Job 2: Backend CI]
        
        Job1 --> F_Check[1. npm ci<br>2. tsc --noEmit<br>3. npm run build]
        Job2 --> B_Check[1. npm ci<br>2. prisma generate<br>3. tsc compile]
    end

    F_Check --> Gate{All Checks Pass?}
    B_Check --> Gate

    Gate -->|Yes: Trigger CD| Vercel[⚡ Vercel: Auto-Deploys Frontend]
    Gate -->|Yes: Trigger CD| Render[🚀 Render: Auto-Deploys Backend]
    Gate -->|No: Fail Build| Alert[❌ Alerts Dev & Blocks Broken Code]
```
