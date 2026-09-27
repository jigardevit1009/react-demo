# 🐰 RabbitMQ AMQP Protocol Integration & Architecture Guide

## 1. Architectural Overview & Why AMQP?

In enterprise applications, operations such as generating comprehensive performance reports, calculating aggregations across 500+ records, or compiling large CSV/PDF files are CPU- and memory-intensive.

If done synchronously in the HTTP request-response cycle:
- The single-threaded Node.js event loop is blocked from servicing other users.
- Clients experience frozen browsers or spinning spinners.
- Cloud platforms (like Render, AWS ALB, or Cloudflare) terminate connections with **HTTP 504 Gateway Timeout** after 30–60 seconds.

To eliminate this bottleneck, **TaskTrack** integrates **RabbitMQ** using the **AMQP 0-9-1 (Advanced Message Queuing Protocol)**.

---

## 2. AMQP Architecture & Queue Topology

```mermaid
graph LR
    subgraph Client Application
        FE[React 19 Frontend]
    end

    subgraph Express API Server
        Producer[Report Producer Service]
    end

    subgraph RabbitMQ AMQP Broker
        Exchange[(Default Exchange)]
        Queue[[Queue: productivity_report_queue<br>Durable: true<br>Persistent: true]]
    end

    subgraph Background Processing
        Worker[Report Consumer Worker<br>Prefetch: 1]
        DB[(PostgreSQL / Supabase)]
    end

    subgraph Real-Time Notification
        Socket[Socket.io Hub]
    end

    FE -->|1. HTTP POST /export| Producer
    Producer -->|2. AMQP publish| Exchange
    Exchange -->|3. Route message| Queue
    Producer -.->|4. HTTP 202 Accepted in 8ms| FE

    Queue -->|5. AMQP fair dispatch| Worker
    Worker -->|6. Query tasks| DB
    Worker -->|7. Compile CSV| Worker
    Worker -->|8. Push ready event| Socket
    Worker -->|9. AMQP ack| Queue
    Socket -->|10. WebSocket event report:ready| FE
```

---

## 3. End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant Frontend as React App (TasksPage)
    participant API as Express API Server (Producer)
    participant Rabbit as RabbitMQ Broker (AMQP)
    participant Worker as Background Consumer Worker
    participant DB as PostgreSQL (Prisma)
    participant Socket as Socket.io Server

    User->>Frontend: Clicks "Export Tasks Report"
    Frontend->>API: HTTP POST /api/reports/export (JWT Auth)
    
    Note over API: Step 1: Generate Job & Package Payload
    API->>API: Generate jobId = job_1727429182_a8f9d
    API->>Rabbit: channel.sendToQueue("productivity_report_queue", Buffer, { persistent: true })
    Rabbit-->>API: Enqueued OK

    Note over API,Frontend: Step 2: Instant Non-Blocking Return
    API-->>Frontend: HTTP 202 Accepted { jobId, status: "QUEUED" }
    Frontend->>User: Displays notification: "Report queued in background..."

    Note over Rabbit,Worker: Step 3: Asynchronous Message Consumption
    Rabbit->>Worker: Delivers AMQP Message (prefetch: 1)
    Worker->>DB: prisma.task.findMany({ include: { employee: true } })
    DB-->>Worker: Returns raw task datasets
    Worker->>Worker: Formats RFC-4180 CSV & saves to storage

    Note over Worker,Socket: Step 4: Real-Time Event Dispatch
    Worker->>Socket: io.emit("report:ready", { jobId, downloadUrl })
    Worker->>Rabbit: channel.ack(msg) [Acknowledges task complete]

    Socket-->>Frontend: WebSocket: emit("report:ready")
    Frontend->>API: HTTP GET /api/reports/download/:jobId
    API-->>Frontend: CSV File Stream (Attachment)
    Frontend->>User: Browser automatically triggers file download!
```

---

## 4. AMQP Protocol Core Concepts Explained

### 1. Connection & Channels (`amqplib`)
AMQP establishes a single, multiplexed TCP connection between the backend and the RabbitMQ broker (`amqp://` or TLS `amqps://`). Instead of opening costly new TCP connections for every message, the application creates lightweight, bi-directional virtual connections called **Channels**:

```typescript
const connection = await amqp.connect(process.env.RABBITMQ_URL);
const channel = await connection.createChannel();
```

### 2. Message Durability & Persistence
To ensure zero data loss during broker crashes or server restarts:
- **Durable Queue**: The queue is declared with `{ durable: true }`, persisting the queue structure to disk.
- **Persistent Messages**: Messages are published with `{ persistent: true }` (deliveryMode = 2), ensuring messages survive restarts.

```typescript
// Declaring queue
await channel.assertQueue("productivity_report_queue", { durable: true });

// Publishing persistent buffer
channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
  persistent: true,
});
```

### 3. Fair Dispatch & Prefetch (`channel.prefetch(1)`)
By default, RabbitMQ sends messages round-robin to consumers regardless of how busy they are. With `channel.prefetch(1)`, RabbitMQ will not dispatch a new message to a worker until that worker has processed and acknowledged (`ack`) the previous one. This distributes workload evenly across multiple worker processes.

### 4. Explicit Acknowledgement (`ack` vs `nack`)
- **`channel.ack(msg)`**: Tells RabbitMQ the report was successfully generated and saved. RabbitMQ safely deletes the message from the queue.
- **`channel.nack(msg, false, true)`**: If an unexpected error occurs (e.g. database timeout), the worker nacks the message, instructing RabbitMQ to requeue it for another worker or send it to a Dead Letter Exchange (DLX).

---

## 5. Production Configuration (CloudAMQP)

On cloud providers like **Render** or **Vercel**, RabbitMQ is hosted on CloudAMQP (managed RabbitMQ clusters):

```env
# AMQPS: Secure TLS encrypted connection protocol
RABBITMQ_URL="amqps://username:password@puffin.rmq2.cloudamqp.com/vhost"
```
