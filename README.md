# Kristallball - Military Asset Management System

A full-stack app for tracking military assets (vehicles, weapons, ammunition)
across multiple bases: purchases, transfers, assignments, expenditures, and
a role-based dashboard, with every change written to an audit trail.

## Structure

```
kristallball/
├── backend/    Express + PostgreSQL API (see backend/README.md)
└── frontend/   React (Vite) + plain CSS dashboard
```

**Styling:** plain CSS, no framework. Each page/component has its own
`.css` file next to it (e.g. `Login.jsx` + `Login.css`). Shared bits used
across multiple pages (page titles, tables, forms, buttons) live in
`src/index.css`, along with a `:root` block of CSS variables for colors
and shadows - that's what `var(--color-slate-800)` etc. refer to
throughout the component CSS files.

## Running it locally

1. **Backend first** - follow `backend/README.md`. Get it running on
   `http://localhost:5050` and confirm `/api/login` works with a test
   account before touching the frontend.
2. **Frontend:**
   ```
   cd frontend
   npm install
   cp .env.example .env   # set VITE_API_BASE_URL to your backend URL
   npm run dev
   ```
3. Open `http://localhost:5173`, log in with one of the seeded test
   accounts (see `backend/README.md` for credentials).

Test accounts

| Role | Username | Password |
|---|---|---|
| Admin | admin_user | AdminPass123! |
| Base Commander (Fort Alpha) | commander_alpha | CommandPass123! |
| Logistics Officer | logistics_officer | LogisticsPass123! |

## What's been verified

Both pieces were actually run and tested together in this session, not
just written:

- Real PostgreSQL instance, schema + seed data loaded, backend booted
  against it
- Every backend endpoint hit directly (login, purchases, transfers,
  assignments, expenditures, dashboard metrics, audit log) and confirmed
  RBAC blocks the right roles
- A dashboard math bug (double-counted balances when no date filter was
  set) was found through this testing and fixed
- Frontend production build (`npm run build`) completed with no errors
- Frontend dev server booted against the live backend, CORS headers
  confirmed correct, login endpoint reachable exactly as the browser
  would call it, and every page's JSX confirmed to compile cleanly

## Still to do before submission

- Deploy backend (Render/Railway) and frontend (Vercel/Netlify) - see
  Step 7 of the original reference material
- Add a `Register users` screen if you want Admins to create accounts
  from the UI (the API route already exists at `POST /api/register`)
- Write the PDF report (architecture, ER diagram, endpoint list, RBAC
  matrix - most of this is already in `backend/README.md`, just needs
  formatting into the deliverable)
- Record the video walkthrough
- Zip the source (exclude `node_modules`) with a database dump
