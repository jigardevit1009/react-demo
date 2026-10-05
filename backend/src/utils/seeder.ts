import prisma from "../config/prisma";
import { hashPassword } from "./password.util";
import {
    EmployeeStatus,
    Priority,
    TaskStatus,
} from "@prisma/client";

const ACTIONS = [
    "Implement", "Refactor", "Optimize", "Build", "Configure",
    "Design", "Audit", "Deploy", "Test", "Integrate",
    "Automate", "Upgrade", "Secure", "Monitor", "Migrate",
    "Enhance", "Document", "Benchmark", "Debug", "Streamline"
];

const TOPICS = [
    "JWT Authentication & Session Expiry Guard",
    "PostgreSQL Indexing & Query Latency Optimization",
    "RabbitMQ Message Broker & Retry Dead-Letter Queues",
    "Real-Time Socket.IO Live Status Broadcasting",
    "Dark Mode Theme Switching & Responsive Layout",
    "Mobile Responsive Drawer Navigation",
    "Docker Multi-Stage Container Build Pipeline",
    "REST API Rate Limiting & Brute Force Shield",
    "Redis In-Memory Caching for User Sessions",
    "End-to-End Automated Test Suite & Coverage",
    "Employee Directory Role & Permission Management",
    "Automated CSV & PDF Report Export Worker",
    "Redux Toolkit Global State Hydration",
    "CloudWatch Metrics Monitoring & Alert System",
    "Role-Based Access Control (RBAC) Route Security",
    "Database Disaster Recovery & Backup Routine",
    "Payment Gateway Webhook Handling & Idempotency",
    "Webpack & Vite Bundle Size Code Splitting",
    "Background Cron Worker for Task Due Date Reminders",
    "Cross-Site Scripting (XSS) & CSRF Vulnerability Fix",
    "Email Notification Engine for Assigned Deliverables",
    "Microservice API Gateway Routing & SSL Termination",
    "Kubernetes Ingress & Pod Auto-Scaling Configuration",
    "GraphQL Mutation Resolvers & Input Validation",
    "Client-Side Form Debouncing & Search Filter"
];

const DESCRIPTIONS = [
    "Ensure high availability, comprehensive test coverage, and documentation for upcoming release.",
    "Refactor legacy logic into maintainable utility modules following SOLID design principles.",
    "Benchmark response latency under peak load and eliminate bottlenecks in database queries.",
    "Coordinate with frontend and backend developers to ensure end-to-end integration.",
    "Review security compliance, encryption standards, and sensitive credential isolation.",
    "Add detailed logging and tracing metrics to monitor errors and performance in production.",
    "Implement automated recovery mechanisms and graceful failure handling.",
    "Optimize memory consumption and ensure resource cleanup on process shutdown."
];

const PRIORITIES: Priority[] = [Priority.HIGH, Priority.MEDIUM, Priority.LOW];
const STATUSES: TaskStatus[] = [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.PENDING,
    TaskStatus.COMPLETED,
];

function generate500Tasks() {
    const tasks = [];
    const now = Date.now();

    for (let i = 1; i <= 500; i++) {
        const action = ACTIONS[(i * 7) % ACTIONS.length];
        const topic = TOPICS[(i * 11) % TOPICS.length];
        const description = DESCRIPTIONS[i % DESCRIPTIONS.length];
        const priority = PRIORITIES[i % PRIORITIES.length];
        const status = STATUSES[i % STATUSES.length];

        // Stagger due dates between -10 days (past due) to +60 days (future)
        const dayOffset = (i % 70) - 10;
        const dueDate = new Date(now + dayOffset * 24 * 60 * 60 * 1000);

        tasks.push({
            title: `${action} ${topic} #${i}`,
            description: `${description} (Task ID #${i})`,
            priority,
            status,
            dueDate,
            assignedTo: null, // All tasks explicitly unassigned as requested
        });
    }

    return tasks;
}

async function seed() {
    console.log("Starting Database Seeding...");

    // 1. Clean existing tasks
    const deletedTasks = await prisma.task.deleteMany();
    console.log(`Cleaned ${deletedTasks.count} existing tasks.`);

    // 2. Ensure SuperAdmin exists (without adding extra employees)
    const adminPassword = await hashPassword("Admin@123");
    const admin = await prisma.employee.upsert({
        where: { email: "admin@tasktrack.com" },
        update: {
            isSuperAdmin: true,
            status: EmployeeStatus.Active,
        },
        create: {
            name: "Super Admin",
            email: "admin@tasktrack.com",
            password: adminPassword,
            role: "System Administrator",
            status: EmployeeStatus.Active,
            isSuperAdmin: true,
        },
    });
    console.log(`Verified SuperAdmin account: ${admin.email}`);

    // 3. Generate 500 Unassigned Tasks
    console.log("Generating 500 unassigned tasks...");
    const taskData = generate500Tasks();

    // Insert in batches of 100 for optimal performance
    const batchSize = 100;
    for (let i = 0; i < taskData.length; i += batchSize) {
        const batch = taskData.slice(i, i + batchSize);
        await prisma.task.createMany({
            data: batch,
        });
        console.log(`Inserted tasks ${i + 1} to ${Math.min(i + batchSize, taskData.length)}...`);
    }

    console.log("\n==========================================");
    console.log("✅ Successfully seeded 500 Unassigned Tasks!");
    console.log(`👤 SuperAdmin: ${admin.email} (Password: Admin@123)`);
    console.log("👥 Sample employees: None added (Ready for manual addition)");
    console.log("==========================================\n");

    process.exit(0);
}

seed().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
});
