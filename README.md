# Regimen AI

Regimen AI is a high-performance, AI-driven personal training platform that engineers precision workout protocols tailored to your unique biology, goals, and environment.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **AI Engine**: [Google Gemini 1.5 Flash](https://ai.google.dev/)
- **Authentication**: [WorkOS AuthKit](https://workos.com/authkit)
- **Database**: Postgres (via [Drizzle ORM](https://orm.drizzle.team/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Shadcn/ui)

## 🛠️ Features

- **Single Session**: Generate a one-off workout based on equipment, time, and goal.
- **Weekly Plan Engineering**: Build complete 7-day training cycles with varying focus.
- **User Persistence**: Workouts are synced to your account.
- **Rate Limiting**: Intelligent limits (2 workouts/day) to ensure quality and prevent abuse.
- **Export Options**: Download your programs as PDF, Markdown, Text, or HTML.

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed.
- A WorkOS account (for Auth).
- A Google AI (Gemini) API key.
- A Postgres database (Supabase, Neon, or local).

### 2. Environment Configuration

Create a `.env.local` file in the root directory and populate it with the following:

```env
# WorkOS Configuration
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/callback
WORKOS_COOKIE_PASSWORD=your_32_char_random_password

# Database Configuration
DATABASE_URL=postgres://user:password@host:port/db

# AI Configuration
AI_API_KEY=your_gemini_api_key
AI_MODEL=gemini-1.5-flash
```

### 3. Installation

```bash
npm install
```

### 4. Database Setup

Push the schema to your database:

```bash
npm run db:push
```

### 5. Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Regimen in action.

## 📜 Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build production bundle.
- `npm run db:push`: Sync Drizzle schema with database.
- `npm run db:studio`: Open Drizzle Studio to explore data.

---

© 2026 Regimen AI · Scientific Excellence in Training
