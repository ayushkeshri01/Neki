# Neki Setup Guide

This guide covers the current Neki stack: credentials-based auth, OTP-backed registration, PostgreSQL via Prisma, SMTP email delivery, and AWS S3 uploads.

## 1. Prerequisites

Before you start, make sure you have:
- Node.js 18+
- npm
- A PostgreSQL database
- An SMTP provider for OTP and password reset emails
- An AWS S3 bucket for image uploads

## 2. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
DIRECT_URL=""

AUTH_SECRET="generate-a-long-random-secret"
AUTH_URL="http://localhost:3000"

AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="dogood-uploads"

SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="smtp-user"
SMTP_PASS="smtp-password"
SMTP_FROM="Neki <noreply@example.com>"

NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Notes:
- `AUTH_SECRET` should be generated with a strong random value.
- `DIRECT_URL` is optional and only needed if your database provider gives you a separate direct connection string for migrations.
- SMTP is required for OTP delivery and password reset emails.

## 3. PostgreSQL Setup

### Local database example

```bash
createdb dogood
```

If you want a dedicated local user:

```bash
psql -d postgres -c "CREATE USER dogood WITH PASSWORD 'dogood123';"
psql -d postgres -c "CREATE DATABASE dogood OWNER dogood;"
```

Then update `.env`:

```env
DATABASE_URL="postgresql://dogood:dogood123@localhost:5432/dogood"
```

### Apply the schema

For local development, you can push the current schema directly:

```bash
npm run db:push
npm run db:generate
```

If you are intentionally creating a new development migration instead:

```bash
npm run db:migrate
```

## 4. SMTP Setup

Neki uses SMTP for:
- OTP registration emails
- Forgot password emails
- Registration/policy confirmation emails

Typical values:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
SMTP_FROM="Neki <noreply@example.com>"
```

If you use Gmail, create an App Password instead of using your normal account password.

## 5. AWS S3 Setup

Create an S3 bucket for uploaded images and configure an IAM user with access to that bucket.

Recommended checklist:
- Create a dedicated bucket such as `dogood-uploads`
- Keep the bucket region aligned with `AWS_REGION`
- Create a dedicated IAM user or role for uploads
- Grant only the S3 permissions the app needs
- Make sure uploaded images are readable by the app's public URL pattern

Then set:

```env
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="dogood-uploads"
```

## 6. Bootstrap the First Admin

Run the admin script with explicit environment variables:

```bash
ADMIN_EMAIL="admin@company.com" \
ADMIN_NAME="Admin User" \
ADMIN_PASSWORD="change-me-long-secret" \
npm run admin:create
```

What this does:
- Creates the user if it does not exist
- Promotes the user to `ADMIN`
- Seeds the initial company domain so you can finish setup in the admin panel

After the script runs:
1. Start the app with `npm run dev`
2. Sign in at `http://localhost:3000/login`
3. Review communities and settings in `/admin`

## 7. Run the App

Install dependencies and start development:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 8. Common Problems

### OTP or reset emails are not arriving
- Verify `SMTP_*` values
- Check whether your provider requires STARTTLS on port `587`
- Confirm `SMTP_FROM` is accepted by your provider

### Database connection errors
- Confirm `DATABASE_URL` is correct
- Make sure PostgreSQL is running
- Re-run `npm run db:push` after schema changes in local development

### Image uploads fail
- Confirm `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, and `AWS_S3_BUCKET`
- Make sure the bucket exists in the configured region
- Verify the IAM identity has permission to upload and delete objects

### Admin bootstrap did not work
- Make sure `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` were passed to the command
- Make sure the database schema has been applied before running `npm run admin:create`

## 9. Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run db:push
npm run db:migrate
npm run db:generate
npm run db:studio
npm run admin:create
npm run test:critical
```
]
```

---

## 9. Production Deployment Checklist

Before going live:

- [ ] Set up production database (not local)
- [ ] Configure production S3 bucket
- [ ] Update `AUTH_URL` to production domain
- [ ] Add production domains to Google OAuth
- [ ] Set secure `AUTH_SECRET` (use a long random string)
- [ ] Enable HTTPS on production
- [ ] Set up proper CORS rules for S3
- [ ] Test admin panel
- [ ] Create initial communities

---

## Quick Setup Summary

| Service | What You Need | Where to Get It |
|---------|---------------|-----------------|
| **Google OAuth** | Client ID & Secret | Google Cloud Console |
| **PostgreSQL** | Connection URL | Local install or cloud provider |
| **AWS S3** | Access Key ID, Secret Access Key, Bucket Name | AWS Console |
| **Admin Account** | Your Google email | Any Google account |

---

Need help? Check the project documentation or create an issue on GitHub.
