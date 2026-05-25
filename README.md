# Formz — Advanced Zero-Trust Form Builder

Formz is a premium, high-performance form builder designed with a zero-trust architecture, robust data validation, and a stunning modern user interface. It was built for speed, security, and developer experience.

## Hackathon Evaluation Links

To make evaluation as smooth as possible, the project comes pre-seeded with 3 themed forms (Tech Conference, Product Feedback, Software Engineer Application) populated with randomized analytics data.

**Demo Credentials:**
- **Email:** `demo@formz.dev`
- **Password:** `demo123`

**API Documentation:**
- **Scalar Reference:** Navigate to `http://localhost:3001/reference` while the development server is running to view the interactive Scalar API documentation.

## Core Features

- **Advanced Form Types:** Support for TEXT, LONG_TEXT, NUMBER, EMAIL, PASSWORD, YES_NO, SINGLE_SELECT, and MULTI_SELECT.
- **Zero-Trust Hardening:** The backend violently rejects submissions that don't precisely match the creator's configured schemas or predefined field options.
- **Auto-Save Persistence:** Both the creator's form building experience and the respondent's form filling experience are protected against accidental page reloads via aggressive `sessionStorage` syncing.
- **Real-Time Analytics:** View submission frequency, average ratings, and chronological response trends computed dynamically in PostgreSQL.
- **Email Notifications:** Asynchronous, fire-and-forget email dispatch. *(Includes an "Evaluation Fallback" that elegantly outputs the styled HTML payload to the terminal if a mock API key is used!)*
- **Data Export:** Download natively generated, beautifully formatted CSV files of all your captured responses.

## Technology Stack

- **Monorepo:** Turborepo
- **Frontend:** Next.js (App Router), TailwindCSS, React Hook Form, Recharts, Lucide Icons
- **Backend:** Express, tRPC, Zod, Scalar API Reference, Resend
- **Database:** PostgreSQL via Drizzle ORM

## Local Setup

**1. Install Dependencies**
```bash
pnpm install
```

**2. Configure Environment**
Copy the `.env.example` files in both `apps/api` and `packages/database` into `.env` files. Ensure you have a valid PostgreSQL URL.

**3. Database Migrations & Seeding**
```bash
pnpm run db:generate
pnpm run db:push
pnpm run db:seed
```

**4. Start the Development Servers**
```bash
pnpm run dev
```

- **Frontend Application:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`
- **Scalar API Docs:** `http://localhost:3001/reference`
