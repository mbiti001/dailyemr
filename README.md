# Daily EMR (Web)

Kenya-focused electronic medical records prototype targeting SHA/SHIF integrations and day-to-day facility workflows.

## Workspaces

- **Patients** – quick search across registered patients
- **Triage** – start visits and capture vitals
- **Labs** – order and complete lab tests
- **Billing** – create invoices, add line items, and accept payments

> When ready, add a claims adapter to talk to SHA endpoints and map service codes.

## Environment variables

Copy `.env.example` to `.env.local` (or `.env`) and fill in credentials:

```ini
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dailyemr?schema=public"

# Session
SESSION_PASSWORD="replace-with-32+chars-random"

# DHIS2/KHIS
DHIS2_BASE_URL="https://hiskenya.org"
DHIS2_TOKEN="replace"

# MFL
MFL_BASE_URL="https://api.mflhealth.go.ke"
MFL_API_KEY="replace"

# SHA/SHIF (claims)
SHA_CLAIMS_BASE_URL="https://claims.sha.example"
SHA_API_KEY="replace"

# App
APP_BASE_URL="http://localhost:3000"
```

## Getting started

1. **Install dependencies**

	```bash
	npm install
	```

2. **Generate the Prisma client** (after every schema change):

	```bash
	npm run prisma:generate
	```

3. **Create the database schema** (requires a Postgres instance matching `DATABASE_URL`):

	```bash
	npm run prisma:migrate -- --name init
	```

4. **Seed realistic demo data** (optional, but unlocks the analytics dashboard out of the box):

	```bash
	npm run seed
	```

	> The seed script clears existing records and inserts facilities, staff, patients, visits, labs, pharmacy stock, invoices, and payments with plausible Kenyan context. Re-run it anytime you need to reset the sandbox dataset.

5. **Run the development server**

	```bash
	npm run dev
	```

Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

## Analytics & dashboards

- The landing page (`/`) and main dashboard (`/dashboard`) load aggregated metrics directly from Prisma. Both routes are marked `dynamic` so they always execute on the server with the latest data.
- Make sure `DATABASE_URL` is available in every environment (local, CI preview, production) where these routes run. When deploying to Vercel or similar platforms, set the variable under the appropriate environment scope.
- Run `npm run seed` after provisioning your database so the hero metrics, revenue panels, visit trends, and lab widgets light up immediately. The seed script can be safely re-executed to reset the demo dataset.

## Continuous integration

Every push or pull request targeting `main` triggers the GitHub Actions workflow defined in `.github/workflows/ci.yml`. The pipeline runs on Ubuntu and performs:

- `npm ci` to install dependencies with a clean lockfile snapshot
- `npx prisma generate` so the Prisma client stays in sync with the schema
- `npm run lint` for ESLint checks
- `npm run typecheck` for TypeScript validation

Keep commits green by running the same commands locally before pushing.

### Smoke tests

- End-to-end smoke tests are written with Playwright (`tests/e2e`). Install browsers locally once with `npx playwright install`.
- Run them against a local dev server via `npm run dev` in one terminal and `npm run test:e2e` in another.
- The staging deployment workflow (`.github/workflows/deploy-staging.yml`) runs the same smoke suite after Terraform apply, using the `STAGING_BASE_URL` secret as the test target.
- GitHub Actions publishes the smoke run artifacts (`staging-smoke-report`) for debugging when a check fails.

## Deployment

Deployments are easiest through Vercel (free tier works for staging).

1. Push changes to GitHub (`origin` now points to `https://github.com/mbiti001/dailyemr.git`).
2. In [Vercel](https://vercel.com/new), select **Import Git Repository** and choose `mbiti001/dailyemr`.
3. When prompted for environment variables, add everything from `.env.example` (especially `DATABASE_URL` and `SESSION_PASSWORD`). Use Vercel Environment → Production/Preview to scope them.
4. Accept the default Next.js build command (`npm run build`) and output directory (`.vercel/output` managed automatically).
5. Each push to `main` will trigger the GitHub Action (quality gates) and Vercel will auto-deploy the latest commit to your production URL.

### Prisma-powered API routes on Vercel

- Every route under `app/api/**` that talks to Prisma is marked with `dynamic = "force-dynamic"`, `revalidate = 0`, and `runtime = "nodejs"`. That ensures Vercel runs them as Node.js serverless functions instead of Edge functions—which would otherwise fail during the build step with "Failed to collect page data" errors.
- Double-check that your Vercel project has `DATABASE_URL` defined for both Build and Runtime scopes. Without it, Prisma will throw at build time.
- If you add new API routes that use Prisma, copy the same runtime exports to keep deployments healthy.

If you prefer another hosting provider (Netlify, Render, Fly.io), mirror the same environment variables and run `npm run build && npm start` in their build setup.

## Tech stack

- **Next.js 14** (App Router, React Server Components)
- **TypeScript** with strict mode
- **Tailwind CSS** for styling
- **Prisma** ORM targeting PostgreSQL
- **SWR** for patient list revalidation

## API surface (preview)

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/patients` | GET | Paginated patient search (query by name, UPI, national ID) |
| `/api/patients` | POST | Create a patient record |
| `/api/visits` | POST | Start a visit |
| `/api/visits/:visitId/vitals` | POST | Append vital-sign measurements |
| `/api/orders/labs` | POST | Raise a lab order and linked lab tests |
| `/api/labs/pending` | GET | List lab tests awaiting results |
| `/api/labs/:id/result` | POST | Record a lab result and close the order |
| `/api/billing/invoices` | POST | Create an invoice for a visit |
| `/api/billing/invoices/:id/items` | POST | Add invoice line items |
| `/api/billing/invoices/:id/payments` | POST | Record payments and auto-close when settled |

## Next steps

- Seed sample data for facilities, patients, and inventory.
- Secure API endpoints with proper authentication/session management.
- Add SHA claims submission and DHIS2 reporting pipelines.
