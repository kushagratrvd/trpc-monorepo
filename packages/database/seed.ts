import "dotenv/config";
import { randomBytes, createHmac } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";
import { usersTable } from "./models/user";
import { formsTable } from "./models/form";
import { formFieldsTable } from "./models/form-field";
import { formSubmissionTable, type FormSubmissionValue } from "./models/form-submission";

const db = drizzle(env.DATABASE_URL);

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────
function hashPassword(salt: string, password: string) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(randomInt(6, 23), randomInt(0, 59), randomInt(0, 59));
  return d;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

// ──────────────────────────────────────
// Seed Data Definitions
// ──────────────────────────────────────

const DEMO_USER = {
  fullName: "Demo User",
  email: "demo@formz.dev",
  password: "demo123",
};

interface SeedField {
  label: string;
  type: "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD" | "LONG_TEXT" | "SINGLE_SELECT" | "MULTI_SELECT";
  description?: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  /** Function to generate a random realistic value for submissions */
  generate: () => string;
}

interface SeedForm {
  title: string;
  description: string;
  visibility: "PUBLIC" | "UNLISTED" | "UNPUBLISHED";
  fields: SeedField[];
  submissionCount: number;
}

const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jake", "Kara", "Leo", "Maya", "Noah", "Olivia", "Paul", "Quinn", "Rita", "Sam", "Tina"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Harris", "Clark", "Lewis", "Walker"];
const domains = ["gmail.com", "outlook.com", "yahoo.com", "proton.me", "company.com", "work.org", "mail.io"];
const companies = ["Acme Corp", "Globex Inc", "Initech", "Umbrella Co", "Wayne Enterprises", "Stark Industries", "Cyberdyne", "Aperture Science"];
const roles = ["Frontend Developer", "Backend Engineer", "Product Manager", "Designer", "Data Scientist", "DevOps Engineer", "QA Tester", "CTO", "Intern", "Full-Stack Dev"];
const feedback = [
  "Great experience overall!", "Could be improved in some areas.", "Loved the UI, very intuitive.",
  "Had some issues with the onboarding.", "Exceptional quality and support.", "Average, nothing special.",
  "Would definitely recommend to others.", "The dashboard is really well designed.", "Needs better mobile support.",
  "Fast and reliable, exceeded my expectations.", "Feature-rich but a bit overwhelming at first.",
  "Simple and elegant — exactly what I needed.", "Documentation could be more detailed.",
];
const cities = ["New York", "San Francisco", "London", "Berlin", "Tokyo", "Sydney", "Toronto", "Mumbai", "Paris", "Seoul", "São Paulo", "Dubai", "Singapore"];

function randomFullName() {
  return `${pick(firstNames)} ${pick(lastNames)}`;
}

function randomEmail(name: string) {
  const clean = name.toLowerCase().replace(/\s+/g, ".");
  return `${clean}${randomInt(1, 99)}@${pick(domains)}`;
}

const FORMS: SeedForm[] = [
  {
    title: "Tech Conference 2026 Registration",
    description: "Register for our annual tech conference. Fill out this form to reserve your spot and customize your experience.",
    visibility: "PUBLIC",
    submissionCount: 15,
    fields: [
      {
        label: "Full Name",
        type: "TEXT",
        placeholder: "e.g. Jane Doe",
        isRequired: true,
        generate: () => randomFullName(),
      },
      {
        label: "Email Address",
        type: "EMAIL",
        placeholder: "you@example.com",
        description: "We'll send your ticket confirmation here.",
        isRequired: true,
        generate: () => {
          const name = randomFullName();
          return randomEmail(name);
        },
      },
      {
        label: "Company / Organization",
        type: "TEXT",
        placeholder: "e.g. Acme Corp",
        isRequired: false,
        generate: () => pick(companies),
      },
      {
        label: "Job Title",
        type: "TEXT",
        placeholder: "e.g. Software Engineer",
        isRequired: false,
        generate: () => pick(roles),
      },
      {
        label: "Number of Tickets",
        type: "NUMBER",
        placeholder: "1",
        description: "Maximum 5 tickets per registration.",
        isRequired: true,
        generate: () => String(randomInt(1, 5)),
      },
      {
        label: "Attending Afterparty?",
        type: "YES_NO",
        description: "Join us for networking and drinks after the event.",
        isRequired: false,
        generate: () => (Math.random() > 0.3 ? "true" : "false"),
      },
    ],
  },

  {
    title: "Product Feedback Survey",
    description: "We'd love to hear your thoughts! Help us improve by sharing your experience with our platform.",
    visibility: "PUBLIC",
    submissionCount: 12,
    fields: [
      {
        label: "Your Name",
        type: "TEXT",
        placeholder: "e.g. John Smith",
        isRequired: true,
        generate: () => randomFullName(),
      },
      {
        label: "Email",
        type: "EMAIL",
        placeholder: "you@example.com",
        isRequired: true,
        generate: () => {
          const name = randomFullName();
          return randomEmail(name);
        },
      },
      {
        label: "Overall Rating (1-10)",
        type: "NUMBER",
        placeholder: "8",
        description: "Rate your overall experience from 1 (worst) to 10 (best).",
        isRequired: true,
        generate: () => String(randomInt(5, 10)),
      },
      {
        label: "Feedback",
        type: "LONG_TEXT",
        placeholder: "Tell us what you think...",
        description: "Share any thoughts, suggestions, or issues.",
        isRequired: true,
        generate: () => pick(feedback),
      },
      {
        label: "Would you recommend us?",
        type: "YES_NO",
        description: "Would you recommend our product to a friend or colleague?",
        isRequired: false,
        generate: () => (Math.random() > 0.2 ? "true" : "false"),
      },
    ],
  },

  {
    title: "Software Engineer Application",
    description: "Apply for our open Software Engineer position. We're looking for passionate developers to join our team.",
    visibility: "UNLISTED",
    submissionCount: 8,
    fields: [
      {
        label: "Full Name",
        type: "TEXT",
        placeholder: "e.g. Sarah Connor",
        isRequired: true,
        generate: () => randomFullName(),
      },
      {
        label: "Email",
        type: "EMAIL",
        placeholder: "candidate@email.com",
        isRequired: true,
        generate: () => {
          const name = randomFullName();
          return randomEmail(name);
        },
      },
      {
        label: "City",
        type: "TEXT",
        placeholder: "e.g. San Francisco",
        description: "Your current city of residence.",
        isRequired: true,
        generate: () => pick(cities),
      },
      {
        label: "Years of Experience",
        type: "NUMBER",
        placeholder: "3",
        description: "Total years of professional software development experience.",
        isRequired: true,
        generate: () => String(randomInt(0, 15)),
      },
      {
        label: "Desired Role",
        type: "SINGLE_SELECT",
        options: roles,
        isRequired: true,
        generate: () => pick(roles),
      },
      {
        label: "Primary Skills",
        type: "MULTI_SELECT",
        options: ["React", "Node.js", "PostgreSQL", "TypeScript", "Python", "Docker", "AWS", "Go"],
        description: "Select all technologies you are proficient in.",
        isRequired: false,
        generate: () => JSON.stringify(Array.from(new Set([pick(["React", "Node.js", "Python", "Go"]), pick(["PostgreSQL", "Docker", "AWS", "TypeScript"])]))),
      },
      {
        label: "Open to Relocation?",
        type: "YES_NO",
        description: "Are you willing to relocate for this position?",
        isRequired: false,
        generate: () => (Math.random() > 0.5 ? "true" : "false"),
      },
      {
        label: "Referral Code",
        type: "TEXT",
        placeholder: "e.g. REF-1234",
        description: "If someone referred you, enter their code here.",
        isRequired: false,
        generate: () =>
          Math.random() > 0.6
            ? `REF-${randomInt(1000, 9999)}`
            : "",
      },
    ],
  },
];


async function seed() {
  console.log("🌱 Starting seed...\n");

  // ─── 1. Create Demo User ───
  console.log(`👤 Creating demo user: ${DEMO_USER.email}`);
  const salt = randomBytes(16).toString("hex");
  const hashedPw = hashPassword(salt, DEMO_USER.password);

  const [user] = await db
    .insert(usersTable)
    .values({
      fullName: DEMO_USER.fullName,
      email: DEMO_USER.email,
      password: hashedPw,
      salt,
      emailVerified: true,
    })
    .returning({ id: usersTable.id });

  if (!user) throw new Error("Failed to create demo user");

  const userId = user.id;
  console.log(`   ✅ User created with id: ${userId}`);
  console.log(`   📧 Login: ${DEMO_USER.email} / ${DEMO_USER.password}\n`);

  // ─── 2. Create Forms + Fields + Submissions ───
  for (const seedForm of FORMS) {
    console.log(`📋 Creating form: "${seedForm.title}"`);

    const [form] = await db
      .insert(formsTable)
      .values({
        title: seedForm.title,
        description: seedForm.description,
        visibility: seedForm.visibility,
        createdBy: userId,
      })
      .returning({ id: formsTable.id });

    if (!form) throw new Error(`Failed to create form: ${seedForm.title}`);

    const formId = form.id;
    console.log(`   ✅ Form created with id: ${formId}`);

    // Insert fields
    const insertedFields: { id: string; labelKey: string; generate: () => string }[] = [];

    for (let i = 0; i < seedForm.fields.length; i++) {
      const f = seedForm.fields[i]!;
      const labelKey = slugify(f.label);

      const [field] = await db
        .insert(formFieldsTable)
        .values({
          formId,
          label: f.label,
          labelKey,
          type: f.type,
          description: f.description ?? null,
          placeholder: f.placeholder ?? null,
          isRequired: f.isRequired,
          index: String(i + 1),
          options: f.options ?? null,
        })
        .returning({ id: formFieldsTable.id });

      if (!field) throw new Error(`Failed to create field: ${f.label}`);

      insertedFields.push({ id: field.id, labelKey, generate: f.generate });
    }

    console.log(`   📝 ${insertedFields.length} fields created`);

    // Insert submissions
    for (let s = 0; s < seedForm.submissionCount; s++) {
      const values: FormSubmissionValue[] = insertedFields.map((f) => ({
        formFieldId: f.id,
        value: f.generate(),
      }));

      await db.insert(formSubmissionTable).values({
        formId,
        values,
        createdAt: randomDate(30),
      });
    }

    console.log(`   📨 ${seedForm.submissionCount} submissions generated\n`);
  }

  console.log("─".repeat(40));
  console.log("✅ Seed complete!");
  console.log(`\n🔑 Demo Login Credentials:`);
  console.log(`   Email:    ${DEMO_USER.email}`);
  console.log(`   Password: ${DEMO_USER.password}`);
  console.log("─".repeat(40));
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
