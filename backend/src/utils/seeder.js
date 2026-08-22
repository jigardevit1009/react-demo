import { supabase } from "../config/supabase.js";

const FIRST_NAMES = [
  "Sarah", "James", "Elena", "Marcus", "Emily", "David", "Jessica", "Daniel",
  "Sophia", "Michael", "Olivia", "Alexander", "Emma", "William", "Ava", "Ethan",
  "Isabella", "Benjamin", "Mia", "Lucas", "Charlotte", "Henry", "Amelia", "Jack",
  "Harper", "Oliver", "Evelyn", "Liam", "Abigail", "Noah", "Ella", "Mason"
];

const LAST_NAMES = [
  "Connor", "Miller", "Rostova", "Vance", "Chen", "Patel", "Taylor", "Anderson",
  "Thomas", "Jackson", "White", "Harris", "Martin", "Clark", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
  "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera"
];

const DEPARTMENTS = ["Engineering", "Design", "Product", "Marketing"];
const ROLES = {
  Engineering: ["Frontend Developer", "Backend Engineer", "Full Stack Dev", "DevOps Engineer", "QA Engineer", "Lead Architect"],
  Design: ["UI/UX Designer", "Product Designer", "Graphic Designer", "Design Lead", "Visual Designer"],
  Product: ["Product Manager", "Scrum Master", "Business Analyst", "Product Owner", "Associate PM"],
  Marketing: ["Marketing Lead", "Content Strategist", "SEO Specialist", "Growth Marketer", "Brand Manager"],
};

const STATUSES = ["Active", "Active", "Active", "On Leave", "Inactive"];
const TASK_PRIORITIES = ["High", "Medium", "Low"];
const TASK_STATUSES = ["Pending", "In Progress", "Completed"];

const TASK_VERBS = [
  "Build", "Design", "Optimize", "Implement", "Refactor", "Test", "Deploy",
  "Document", "Configure", "Review", "Audit", "Migrate", "Upgrade", "Monitor"
];

const TASK_SUBJECTS = [
  "RTK Query Cache Invalidation", "Supabase Realtime Sync", "JWT Authentication Guard",
  "Responsive Sidebar Navigation", "Light/Dark Theme Context", "Custom useDebounce Hook",
  "Pagination & Chunk Loading", "Vite Production Bundle Splitting", "React.memo Optimization",
  "Employee Directory Filters", "Task Productivity Analytics", "REST API Error Handling",
  "Database Seeder Script", "Automated E2E Test Suite", "Docker Container Setup"
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
        title: `${verb} ${subject} #${i}`,
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
