import { supabase } from "../config/supabase.js";

const FIRST_NAMES = [
  "Aarav", "Priya", "Rahul", "Ananya", "Rohan", "Sneha", "Aditya", "Neha",
  "Vikram", "Pooja", "Arjun", "Kavya", "Siddharth", "Riya", "Rajesh", "Deepika",
  "Amit", "Shreya", "Karan", "Tanvi", "Nikhil", "Isha", "Manish", "Divya",
  "Suresh", "Meera", "Varun", "Anushka", "Gaurav", "Swati", "Sanjay", "Preeti",
  "Kunal", "Sakshi", "Harsh", "Shruti", "Akash", "Ritu", "Vivek", "Payal",
  "Abhishek", "Sonam", "Prateek", "Simran", "Alok", "Nandini", "Tarun", "Bhavna"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Verma", "Gupta", "Singh", "Kumar", "Shah", "Mehta",
  "Joshi", "Reddy", "Nair", "Iyer", "Chopra", "Malhotra", "Kapoor", "Bhatia",
  "Saxena", "Deshmukh", "Kulkarni", "Agarwal", "Banerjee", "Chatterjee", "Mishra", "Pandey",
  "Rao", "Shetty", "Ghosh", "Yadav", "Trivedi", "Choudhury", "Bose", "Dutta",
  "Pillai", "Menon", "Mukherjee", "Das", "Desai", "Jain", "Thakur", "Soni"
];

const DEPARTMENTS = ["Engineering", "Design", "Product", "Marketing"];
const ROLES = {
  Engineering: [
    "Frontend Developer",
    "Backend Engineer",
    "Full Stack Developer",
    "Software Engineer Trainee",
    "DevOps Engineer",
    "Tech Lead"
  ],
  Design: [
    "UI/UX Designer",
    "Product Designer",
    "Graphic Designer",
    "UI/UX Design Trainee",
    "Design Lead",
    "Visual Designer"
  ],
  Product: [
    "Product Manager",
    "Associate PM Trainee",
    "Scrum Master",
    "Product Owner",
    "Business Analyst",
    "Technical Product Manager"
  ],
  Marketing: [
    "Digital Marketing Specialist",
    "Growth Marketer",
    "SEO Specialist",
    "Marketing Trainee",
    "Content Strategist",
    "Brand Manager"
  ]
};

const STATUSES = ["Active", "Active", "Active", "On Leave", "Inactive"];
const TASK_PRIORITIES = ["High", "Medium", "Low"];
const TASK_STATUSES = ["Pending", "In Progress", "Completed"];

const TASK_VERBS = [
  "Develop", "Configure", "Optimize", "Implement", "Refactor", "Test", "Deploy",
  "Automate", "Debug", "Migrate", "Upgrade", "Monitor", "Audit", "Integrate",
  "Troubleshoot", "Set up", "Resolve", "Benchmark"
];

const TASK_SUBJECTS = [
  "RESTful API Endpoints with Node.js & Express",
  "PostgreSQL Query Indexing & Performance Tuning",
  "Docker Containerization for Microservices",
  "CI/CD Build Pipeline in GitHub Actions",
  "JWT Authentication & Role-Based Access Control (RBAC)",
  "Redis Cache Invalidation & Session Store",
  "React & Redux Toolkit State Synchronization",
  "Kubernetes Cluster Deployment & Auto-scaling",
  "AWS S3 Cloud Bucket Storage Integration",
  "Automated E2E Test Suite with Cypress & Jest",
  "Nginx Reverse Proxy & SSL Certificate Renewal",
  "IT Network Firewall & VPN Access Protocols",
  "Kafka Message Queue & Event Streaming",
  "Employee Directory Search & Pagination Filters",
  "System Health Check & Real-time Metrics Dashboard",
  "Database Replication & Automated Backup Disaster Recovery",
  "GraphQL Query Resolvers & Schema Stitching",
  "Cybersecurity Vulnerability Scan & Patch Audit",
  "Linux Server Hardening & SSH Key Management",
  "Vite Frontend Production Bundle Splitting & Tree Shaking",
  "WebSocket Real-time Notifications & Chat Gateway",
  "OAuth 2.0 Single Sign-On (SSO) Protocol",
  "TypeScript Type Definitions & Strict Mode Migration",
  "IT Asset Management & Helpdesk Ticketing System"
];

async function seedDatabase() {
  console.log("\n==============================================");
  console.log("🌱 Starting 500 Record Supabase Seeder (VARCHAR Assignee Names)...");
  console.log("==============================================\n");

  try {
    // 1. Clear old records
    console.log("🧹 Clearing old records...");
    await supabase.from("tasks").delete().neq("id", 0);
    await supabase.from("employees").delete().neq("id", 0);

    // 2. Generate and Insert 250 Employees in batches of 100
    console.log("\n👥 Inserting 250 Employee records into Supabase...");
    const employeesData = [];
    for (let i = 1; i <= 250; i++) {
      const fName = FIRST_NAMES[i % FIRST_NAMES.length];
      const lName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
      const dept = DEPARTMENTS[i % DEPARTMENTS.length];
      const roleList = ROLES[dept];
      const role = roleList[i % roleList.length];
      const status = STATUSES[i % STATUSES.length];
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@company.com`;

      employeesData.push({
        name: `${fName} ${lName}`,
        email,
        role,
        department: dept,
        status,
      });
    }

    const createdEmployees = [];
    for (let i = 0; i < employeesData.length; i += 100) {
      const batch = employeesData.slice(i, i + 100);
      const { data, error } = await supabase
        .from("employees")
        .insert(batch)
        .select("id, name");

      if (error) throw error;
      if (data) createdEmployees.push(...data);
      console.log(`   ✓ Inserted employees ${i + 1} - ${Math.min(i + 100, employeesData.length)}`);
    }

    // 3. Generate and Insert 250 Tasks storing employee names directly as VARCHAR
    console.log("\n📋 Inserting 250 Task records with employee names...");
    const tasksData = [];
    for (let i = 1; i <= 250; i++) {
      const verb = TASK_VERBS[i % TASK_VERBS.length];
      const subject = TASK_SUBJECTS[(i * 2) % TASK_SUBJECTS.length];
      const assignedEmp = createdEmployees.length > 0
        ? createdEmployees[i % createdEmployees.length]
        : null;

      const priority = TASK_PRIORITIES[i % TASK_PRIORITIES.length];
      const status = TASK_STATUSES[i % TASK_STATUSES.length];

      const day = String((i % 28) + 1).padStart(2, "0");
      const month = String((i % 12) + 1).padStart(2, "0");
      const dueDate = `2026-${month}-${day}`;

      tasksData.push({
        title: `${verb} ${subject}`,
        assignee: assignedEmp ? assignedEmp.name : "Unassigned",
        priority,
        status,
        due_date: dueDate,
      });
    }

    for (let i = 0; i < tasksData.length; i += 100) {
      const batch = tasksData.slice(i, i + 100);
      const { error } = await supabase.from("tasks").insert(batch);
      if (error) throw error;
      console.log(`   ✓ Inserted tasks ${i + 1} - ${Math.min(i + 100, tasksData.length)}`);
    }

    console.log("\n==============================================");
    console.log("🎉 SUCCESS! 500 Total Records Seeded with Real Employee Names!");
    console.log("   • 250 Employees");
    console.log("   • 250 Tasks with VARCHAR assignee names");
    console.log("==============================================\n");
  } catch (err) {
    console.error("\n❌ Seeding error:", err.message);
  }
}

seedDatabase();
