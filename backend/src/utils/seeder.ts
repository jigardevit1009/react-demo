import prisma from "../config/prisma";
import { hashPassword } from "./password.util";
import {
    EmployeeStatus,
    Priority,
    TaskStatus,
} from "@prisma/client";

async function seed() {
    console.log("Starting Database Seeding...");

    // Clean existing records (optional)
    await prisma.task.deleteMany();
    await prisma.employee.deleteMany();
    console.log("Cleaned existing records.");

    const adminPassword = await hashPassword("Admin@123");
    const userPassword = await hashPassword("User@123");

    // Create SuperAdmin
    const admin = await prisma.employee.create({
        data: {
            name: "Super Admin",
            email: "admin@tasktrack.com",
            password: adminPassword,
            role: "System Administrator",
            status: EmployeeStatus.Active,
            isSuperAdmin: true, // SuperAdmin Privileges
        },
    });
    console.log("Created SuperAdmin:", admin.email);

    // Create Sample Employees
    const emp1 = await prisma.employee.create({
        data: {
            name: "Sarah Connor",
            email: "sarah@company.com",
            password: userPassword,
            role: "Software Developer",
            status: EmployeeStatus.Active,
            isSuperAdmin: false,
        },
    });

    const emp2 = await prisma.employee.create({
        data: {
            name: "Michael Scott",
            email: "michael@company.com",
            password: userPassword,
            role: "Software Developer",
            status: EmployeeStatus.Active,
            isSuperAdmin: false,
        },
    });

    const emp3 = await prisma.employee.create({
        data: {
            name: "Pam Beesly",
            email: "pam@company.com",
            password: userPassword,
            role: "Software Developer",
            status: EmployeeStatus.Active,
            isSuperAdmin: false,
        },
    });
    console.log("Created sample employees.");

    // Create Sample Tasks
    await prisma.task.createMany({
        data: [
            {
                title: "Build Responsive Navbar & Dark Mode",
                description: "Configure Tailwind CSS v4 dark mode variant and mobile drawer.",
                priority: Priority.HIGH,
                status: TaskStatus.COMPLETED,
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                assignedTo: emp1.id,
            },
            {
                title: "Setup Prisma ORM & Database Indexing",
                description: "Link PostgreSQL schema with 1-to-many relationship and composite indexes.",
                priority: Priority.HIGH,
                status: TaskStatus.IN_PROGRESS,
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                assignedTo: emp1.id,
            },
            {
                title: "Q3 Enterprise Sales Strategy Review",
                description: "Compile client pipeline metrics for quarterly executive meeting.",
                priority: Priority.MEDIUM,
                status: TaskStatus.PENDING,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                assignedTo: emp2.id,
            },
            {
                title: "Design System UI Kit in Figma",
                description: "Create reusable buttons, badges, modals, and card components.",
                priority: Priority.LOW,
                status: TaskStatus.IN_PROGRESS,
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                assignedTo: emp3.id,
            },
        ],
    });
    console.log("Created sample tasks.");

    console.log("\n==========================================");
    console.log("SuperAdmin : admin@tasktrack.com / Admin@123");
    console.log("Employee 1 : sarah@company.com / User@123");
    console.log("Employee 2 : michael@company.com / User@123");
    console.log("==========================================\n");

    process.exit(0);
}

seed().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
});
