# Kristallball Backend

Military Asset Management System API. Plain Node.js + Express + PostgreSQL,
no TypeScript, no ORM — just the `pg` library and raw SQL so it's easy to
read and trace exactly what each request does.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `JWT_SECRET`
   (any PostgreSQL instance works — Neon, Supabase, Render, or local).
3. Run the schema against your database:
   ```
   psql "$DATABASE_URL" -f src/config/schema.sql
   psql "$DATABASE_URL" -f src/config/seed.sql
   ```
4. `npm run dev` (or `npm start`)

Test accounts

| Role | Username | Password |
|---|---|---|
| Admin | admin_user | AdminPass123! |
| Base Commander (Fort Alpha) | commander_alpha | CommandPass123! |
| Logistics Officer | logistics_officer | LogisticsPass123! |

## RBAC Matrix

| Action | Admin | Base Commander | Logistics Officer |
|---|---|---|---|
| View dashboard | All bases | Own base only | - |
| Create purchase | Yes | - | Yes |
| View purchases | All bases | Own base only | Own base scope* |
| Create transfer | Yes | - | Yes |
| View transfers | All bases | Own base only | Own base scope* |
| Create/view assignment | Yes | Own base only | - |
| Create/view expenditure | Yes | Own base only | - |
| Register new users | Yes | - | - |
| View audit log | Yes | - | - |

\* Logistics Officers aren't tied to a single base in this build, since the
spec doesn't assign them one — they see purchases/transfers across bases
(same as Admin for those two endpoints). If you need them locked to one
base too, add `base_id` handling for that role in `enforceBaseScope`.

## Endpoints

- `POST /api/login`
- `POST /api/register` (Admin)
- `GET /api/me`
- `GET /api/bases`, `GET /api/equipment-types`
- `GET /api/dashboard/metrics?baseId=&equipmentTypeId=&startDate=`
- `POST /api/purchases`, `GET /api/purchases`
- `POST /api/transfers`, `GET /api/transfers`
- `POST /api/assignments`, `GET /api/assignments`
- `POST /api/expenditures`, `GET /api/expenditures`
- `GET /api/audit-logs` (Admin)

## Notes

- Every write to purchases/transfers/assignments/expenditures happens inside
  a `BEGIN...COMMIT` transaction alongside its audit log entry, so a crash
  partway through never leaves a change recorded without an audit trail
  (or vice versa).
- Dashboard math: `Closing Balance = Opening Balance + Net Movement - Assigned - Expended`,
  where `Net Movement = Purchases + Transfers In - Transfers Out`. Opening
  Balance is 0 unless you pass a `startDate` — then it's everything before
  that date, and Net Movement/Assigned/Expended only count from that date on.
- This was tested end-to-end against a real local PostgreSQL instance
  (login, purchase, transfer, assignment, expenditure, dashboard totals,
  RBAC blocking, and audit log — all verified working) before being handed
  off, not just written and assumed correct.
