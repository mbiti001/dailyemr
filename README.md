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

4. **Run the development server**

	```bash
	npm run dev
	```

	Visit [http://localhost:3000](http://localhost:3000) to access the dashboard.

	## Continuous integration

	Every push or pull request targeting `main` triggers the GitHub Actions workflow defined in `.github/workflows/ci.yml`. The pipeline runs on Ubuntu and performs:

	- `npm ci` to install dependencies with a clean lockfile snapshot
	- `npx prisma generate` so the Prisma client stays in sync with the schema
	- `npm run lint` for ESLint checks
	- `npm run typecheck` for TypeScript validation

	Keep commits green by running the same commands locally before pushing.

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
