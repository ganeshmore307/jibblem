# TrackDeck

A full-featured time tracking and workforce management web app (an independent
functional clone of the Jibble product experience, with original branding and
demo data). Built with Next.js 14 (App Router), TypeScript and Tailwind CSS.

## Features

- **Authentication** — cookie-based demo login with seeded members.
- **Dashboard** — who's in/out, team hours chart, my activity, pending time off, upcoming holidays.
- **Timesheets** — monthly calendar (weekly + monthly totals, holidays, faded adjacent months),
  weekly team table, daily entries with add/edit/delete, breaks, activities, projects, notes,
  statuses, validation, member selector, date navigation with URL state.
- **Clock in/out** — live clock widget in the header with breaks.
- **Attendance** — daily statuses (present, late, absent, clocked in, holiday, time off, day off) and summary cards.
- **People** — searchable, filterable, sortable, paginated member table, profile drawer, add/archive members, role changes.
- **Time Off** — request list with approve/reject workflow, team calendar, request form, policies, holidays.
- **Reports** — tracked time (filters, date range, daily chart, activity breakdown, CSV export) and attendance insights.
- **Settings** — time tracking policies, work schedules, time off policies, holiday calendar,
  locations/geofences, activities/projects/clients, organization profile and permissions, integrations, invoices.
- **Responsive** — desktop sidebar collapses; mobile drawer navigation; tables scroll horizontally.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with:

- **Email:** `kiran@upscaledemo.com` (any seeded member email works)
- **Password:** `demo1234`

No environment variables are required. Data is an in-memory, deterministically
seeded demo database — mutations persist for the lifetime of the server process
and reset on restart.

## Scripts

| Command             | Description               |
| ------------------- | ------------------------- |
| `npm run dev`       | Start the dev server      |
| `npm run build`     | Production build          |
| `npm run start`     | Serve the production build|
| `npm run lint`      | ESLint                    |
| `npm run typecheck` | TypeScript type checking  |

## Architecture

- `src/lib/types.ts` — domain types (members, entries, leave, schedules, ...).
- `src/lib/time.ts` — date/time helpers; durations are integer minutes.
- `src/lib/data/seed.ts` — deterministic seed data (~120 days of entries for 11 members).
- `src/lib/data/store.ts` — in-memory singleton database.
- `src/lib/data/timesheets.ts` — timesheet/attendance/report aggregation.
- `src/app/api/*` — REST-style route handlers for auth, clock, entries, members, leave, settings.
- `src/app/(app)/*` — authenticated pages; `src/components/*` — client components.
