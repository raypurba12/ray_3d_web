# Ray Purba — 3D Portfolio + Custom CMS

Immersive portfolio frontend (React + Three.js) with a self-hosted CMS API
(Express + Prisma + MySQL) and an admin panel at `/admin`.

## Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18, Vite 7, TypeScript, Tailwind CSS, Three.js / R3F |
| API | Express 5, TypeScript, Prisma 5, MySQL 8 |
| Auth | HttpOnly cookie session (15m access + 30d rotating refresh), bcrypt |
| Storage | Local disk or Cloudinary (optional) |

## Repository layout

```
.
├── src/                 # React portfolio + admin UI
├── api/                 # Express CMS API
├── public/              # static assets, robots.txt, sitemap.xml, .htaccess
├── docs/                # architecture + deployment runbooks
└── .github/workflows/   # CI
```

## Requirements

- Node.js 20 or newer (API declares `engines.node >= 20`)
- MySQL 8 (local Laragon/XAMPP works)

## Local development

Two terminals are required: one for the API, one for Vite.

### 1. API

```bash
cd api
cp .env.example .env             # Windows: copy .env.example .env
npm ci
```

Edit `api/.env`:

- `DATABASE_URL` — your MySQL connection string
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — two different random strings, 32+ chars
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` — used by the seed (password 12+ chars)

Then:

```bash
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

API runs on `http://localhost:5000`. Health check: `GET /api/health`.

### 2. Frontend

```bash
cp .env.example .env             # Windows: copy .env.example .env
npm ci
npm run dev
```

Open `http://localhost:5173` for the portfolio and
`http://localhost:5173/admin` for the CMS (log in with `ADMIN_EMAIL` /
`ADMIN_PASSWORD`).

`VITE_SITE_URL` powers canonical/Open Graph URLs; `VITE_CONTACT_EMAIL` is an
optional fallback contact address until the CMS profile has one.

## Scripts

| Command | Location | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | root | Vite dev server |
| `npm run lint` | root | ESLint |
| `npm run ts:check` | root | TypeScript type check |
| `npm run build` | root | Production build to `dist/` |
| `npm run dev` | `api/` | API with nodemon + tsx |
| `npm run build` | `api/` | Compile API to `api/dist/` |
| `npm run prisma:migrate` | `api/` | Create/apply dev migration |
| `npm run prisma:deploy` | `api/` | Apply migrations in production |
| `npm run prisma:seed` | `api/` | Seed admin/profile/technologies/tags |

## Content and offline behavior

The site no longer ships fake demo projects, testimonials, or contact details.
Public sections load from the CMS. Successful responses are cached in
`localStorage` (`rp_content_v1`); if the API is unreachable the last saved
content is shown together with a retry banner, and sections without data show
an explicit empty state.

## Auth model

- Access tokens expire after 15 minutes; refresh tokens after 30 days.
- Refresh tokens are rotated on every use; reuse outside a 10-second race
  window revokes the whole token family.
- `POST /api/auth/logout` revokes the refresh session.
- `PUT /api/auth/password` requires the current password, bumps
  `tokenVersion` (invalidating existing access tokens), and revokes all
  refresh sessions.
- Only `SUPER_ADMIN` users can create new admin accounts.

## Deployment

Production target: Domainesia cPanel (Node.js App + MySQL, static frontend in
`public_html`). Follow [docs/DEPLOY_CPANEL.md](docs/DEPLOY_CPANEL.md).

## License

MIT
