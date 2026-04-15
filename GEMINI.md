# Project: Socity PWA

Mobile-first Progressive Web App (PWA) for managing residential society data and maintenance payments.

## Architecture
- **Framework**: Next.js (App Router, React 19)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (managed via `pg` pool in `src/lib/db.js`)
- **PWA**: `@ducanh2912/next-pwa` for manifest and service worker management.
- **Scanning**: `html5-qrcode` for client-side QR identification.

## Core Workflows
1. **QR Login**: The homepage (`src/app/page.js`) uses `QRScanner` to read a JSON-formatted QR code containing user identity (`uid`, `flat_number`, etc.).
2. **Session Persistence**: Successful login saves the user object to `localStorage` under `socity_user_session`.
3. **Database Interaction**: Uses Server Actions within models (`src/models/*.js`) for data fetching and mutations.

## Data Entities
- **Users**: Identified by `society`, `pocket`, and `flat_number`. Linked to a unique `uid`.
- **User Info**: Stores profile data (name, email, mobile, cars). 1:1 relationship with Users.
- **Payments**: Records maintenance/society dues. 1:N relationship with Users.

## Environment Variables
- `PG_USER`: Postgres database user
- `PG_HOST`: Postgres host address
- `PG_DATABASE`: Database name
- `PG_PASSWORD`: Postgres password
- `PG_PORT`: Postgres port (default 5432)
