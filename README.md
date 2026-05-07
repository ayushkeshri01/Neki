# Neki

Neki is a company community platform for sharing social work, donations, and volunteer activities.

## Features

- Email/password sign-in with OTP-backed registration
- Company domain allowlist for self-service signup
- Forgot password, reset password, and authenticated password change flows
- Community posts with AWS S3 image uploads
- Multi-community participation and community-scoped feeds
- Points and leaderboard
- Admin tools for users, communities, posts, and settings
- Moderation notices and post auto-hide on dislike threshold

## Quick Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the required values:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="..."
AUTH_URL="http://localhost:3000"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="neki-uploads"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="Neki <noreply@example.com>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Prepare the database

```bash
npm run db:push
npm run db:generate
```

### 4. Bootstrap the first admin

```bash
ADMIN_EMAIL="admin@company.com" \
ADMIN_NAME="Admin User" \
ADMIN_PASSWORD="change-me-long-secret" \
npm run admin:create
```

Use an email from the company domain you want to bootstrap first, then review the allowlist in the admin settings screen.

### 5. Start development

```bash
npm run dev
```

## Detailed Setup Guide

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:
- PostgreSQL setup
- SMTP setup for OTP and password reset emails
- AWS S3 configuration for uploads
- Admin bootstrap steps

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build the Next.js app
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Create and apply a development migration
npm run db:push      # Push the schema directly to the database
npm run db:reset     # Reset the local database with the project helper
npm run db:studio    # Open Prisma Studio
npm run admin:create # Create or promote an admin user
npm run test:critical # Run the current test suite
```

## Tech Stack

- Frontend: Next.js 16, React 19, Tailwind CSS v4
- UI: shadcn/ui (default style)
- Authentication: NextAuth.js v5 with credentials auth
- Registration and email flows: OTP verification + Nodemailer
- Database: PostgreSQL + Prisma 5
- Storage: AWS S3
- Icons: Lucide React

## Project Structure

```text
neki/
├── app/
│   ├── (auth)/          # Login, signup, forgot/reset password
│   ├── (protected)/     # Authenticated app pages
│   └── api/             # Route handlers
├── components/
│   ├── layout/          # Navbar, theme, notices
│   ├── posts/           # Post UI and create form
│   ├── communities/     # Community cards and views
│   └── ui/              # shadcn components
├── lib/                 # Auth, Prisma, S3, settings helpers
├── prisma/              # Schema and migrations
├── scripts/             # Project scripts such as admin bootstrap
└── tests/               # Automated tests
```

## License

MIT
