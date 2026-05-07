# Neki — Tech Stack & Deployment Guide

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 16.2.3 |
| Language | TypeScript | 5.x |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| UI Components | shadcn/ui (Radix primitives) | default style |
| Animations | Framer Motion | 12.38.0 |
| Icons | Lucide React | 1.8.0 |
| Auth | NextAuth.js (Auth.js) | v5 beta (5.0.0-beta.31) |
| Auth Strategy | JWT (no database sessions) | — |
| Database | PostgreSQL (hosted) | — |
| ORM | Prisma | 6.19.3 |
| DB Adapter | `@auth/prisma-adapter` | 2.11.2 |
| File Storage | AWS S3 | — |
| Email | Nodemailer (SMTP) | 7.0.13 |
| State Management | Zustand | 5.0.12 |
| Toast Notifications | Sonner | 2.0.7 |
| Theme | Custom (replaces next-themes) | — |
| Password Hashing | bcryptjs | 3.0.3 |
| CSS Utilities | clsx, tailwind-merge, class-variance-authority | — |
| Linting | ESLint + `eslint-config-next` | 9 / 16.2.3 |
| Testing | Node native (`node:test` + `node:assert/strict`) | — |
| Script Runner | tsx | 4.21.0 |
| Package Manager | npm | — |
| Deployment Target | Vercel | — |

---

## Architecture

```
Browser → Vercel (Next.js SSR)
            ├── API Routes (Next.js Edge/Serverless)
            ├── Server Components (RSC)
            └── Client Components (React)

Next.js Server
  ├── PostgreSQL (Neon / RDS / Supabase)
  ├── AWS S3 (image uploads)
  └── SMTP (email: OTP, password reset)
```

### Key Patterns
- **App Router** with `(auth)` and `(protected)` route groups
- **Server Components** by default, `"use client"` only for interactive components
- **JWT session strategy** (no DB sessions)
- **Credentials provider** for login (email + password)
- **Points system**: +50 points per post
- **Moderation**: dislike threshold (configurable, default 15%), admin hide/remove/restore

---

## Prerequisites

- Node.js 18+ (recommended: 20 LTS)
- PostgreSQL database (Neon, AWS RDS, Supabase, or self-hosted)
- AWS account (S3 bucket for image uploads)
- SMTP credentials (Gmail App Password or SendGrid or similar)
- Vercel account (for deployment)
- Domain name (for production)

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | NextAuth encryption secret | `openssl rand -base64 32` |
| `AUTH_URL` | Public app URL | `https://yourdomain.com` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (metadata) | `https://yourdomain.com` |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | — |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | — |
| `AWS_REGION` | AWS region for S3 | `us-east-1` |
| `AWS_S3_BUCKET` | S3 bucket name | `neki-uploads` |

### Email (for OTP, password reset)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS | `false` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password / app password | — |
| `SMTP_FROM` | From address | — |

### Admin Seed (one-time)

| Variable | Description |
|----------|-------------|
| `ADMIN_EMAIL` | Admin email address |
| `ADMIN_NAME` | Admin display name |
| `ADMIN_PASSWORD` | Admin password |

---

## Database Setup

### Option A: Neon (Serverless PostgreSQL — Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create a project, copy the connection string
3. Add `?sslmode=require` to the connection string
4. Set as `DATABASE_URL`

### Option B: AWS RDS

1. Create a PostgreSQL instance (free tier eligible)
2. Configure security group to allow inbound from Vercel IPs
3. Set connection string with SSL mode

### Option C: Supabase

1. Create a Supabase project
2. Copy the PostgreSQL connection string (Transaction mode for Prisma)
3. Pooler connection recommended for serverless

### Run Migrations

```bash
npm run db:push          # Push schema to database (dev)
# or
npm run db:migrate       # Create and apply migrations
npm run db:generate      # Generate Prisma client
```

---

## AWS S3 Setup

### Step 1: Create S3 Bucket

```bash
aws s3 mb s3://neki-uploads --region <your-region>
```

### Step 2: Configure public read access

Apply bucket policy (see `scratch/policies/neki-uploads-bucket-policy.json`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::neki-uploads/*"
    }
  ]
}
```

### Step 3: Create IAM user

Create an IAM user with programmatic access and attach the uploader policy (see `scratch/policies/neki-uploader-user-policy.json`).

### Step 4: CORS Configuration

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedHeaders": ["*"]
  }
]
```

---

## Email Setup

### Gmail (App Password)

1. Enable 2-Factor Authentication on the sending Gmail account
2. Generate an App Password at: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

### Other SMTP Providers

| Provider | SMTP Host | Port |
|----------|-----------|------|
| SendGrid | `smtp.sendgrid.net` | 587 |
| Mailgun | `smtp.mailgun.org` | 587 |
| Postmark | `smtp.postmarkapp.com` | 587 |
| Amazon SES | `email-smtp.<region>.amazonaws.com` | 587 |

---

## Deployment to Vercel

### Step 1: Prepare the project

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build locally to verify
npm run build
```

### Step 2: Push to GitHub/GitLab

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import the repository
2. Configure build settings (auto-detected from Next.js):
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

3. Add all environment variables (see Environment Variables section above)

4. Deploy

### Step 4: Configure domain (neki.vikasgroup.in)

#### 4a. Add domain to Vercel

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Project → Settings → Domains**
3. Enter `neki.vikasgroup.in` and click **Add**
4. Vercel will show you the DNS records to configure

#### 4b. Configure DNS records (at your domain registrar)

Go to your domain provider's DNS settings for `vikasgroup.in` (e.g., GoDaddy, Namecheap, Cloudflare, etc.) and add:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| CNAME | `neki` | `cname.vercel-dns.com` | Points the subdomain to Vercel |
| TXT | `neki` | `vc-domain-verify=neki.vikasgroup.in,<vercel-id>` | Domain verification (shown in Vercel UI) |

If using Cloudflare, ensure the proxy is set to **DNS only** (grey cloud), not Proxied (orange cloud), for the CNAME record — Vercel handles SSL/TLS directly.

**DNS Propagation:** Changes can take from a few minutes up to 48 hours. Vercel will detect the change automatically and provision an SSL certificate.

#### 4c. Verify SSL certificate

Once DNS propagates, Vercel automatically provisions a TLS certificate via Let's Encrypt. You can check status at:
**Project → Settings → Domains → `neki.vikasgroup.in`**

A green checkmark with "Valid" means HTTPS is active.

#### 4d. Update environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

```
AUTH_URL = https://neki.vikasgroup.in
NEXT_PUBLIC_SITE_URL = https://neki.vikasgroup.in
```

Remove the old `AUTH_URL` value from preview/development environments.

#### 4e. Update Google OAuth (if using)

If Google OAuth is added later, update the authorized redirect URI in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

```
https://neki.vikasgroup.in/api/auth/callback/google
```

#### 4f. (Optional) Configure email sending domain

If sending emails from `@vikasgroup.in`, configure SPF and DKIM records in your DNS to improve deliverability:

| Type | Name | Value |
|------|------|-------|
| TXT | `vikasgroup.in` | `"v=spf1 include:_spf.google.com ~all"` (for Gmail SMTP) |
| TXT | `vikasgroup.in` | `"v=DMARC1; p=quarantine; rua=mailto:admin@vikasgroup.in"` |

### Step 5: Redeploy after domain changes

After updating environment variables, trigger a redeployment:

- **Vercel Dashboard:** Project → Deployments → ⋮ → Redeploy
- Or push a new commit to the repo

### Step 6: Seed admin user

After deployment, run the admin seed script via Vercel CLI:

```bash
npm i -g vercel
vercel env pull
npm run admin:create
```

Or run it locally against the production database:

```bash
DATABASE_URL="<production-db-url>" npm run admin:create
```

---

## Post-Deployment Steps

### 1. Configure Allowed Domains

Sign in as admin, go to `/admin/settings`, and add allowed email domains for registration.

### 2. Create Communities

Go to `/admin/communities` and create communities.

### 3. Configure Privacy Policy

Update the `privacyPolicyVersion` in `AppSettings` to trigger re-acceptance.

### 4. Verify Email Delivery

Test the OTP signup flow to ensure SMTP is properly configured.

### 5. Set up S3 Lifecycle Rules (Optional)

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket neki-uploads \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "delete-old-uploads",
      "Status": "Enabled",
      "Expiration": { "Days": 365 }
    }]
  }'
```

---

## Production Checklist

### Security

- [ ] `AUTH_SECRET` is a strong random value (`openssl rand -base64 32`)
- [ ] Database uses SSL (`?sslmode=require`)
- [ ] S3 bucket blocks public ACLs (uses bucket policy instead)
- [ ] SMTP credentials are app passwords, not primary account passwords
- [ ] Rate limiting is configured on auth routes (recommend Vercel WAF or custom middleware)
- [ ] CSP headers are set (recommend via `next.config.js` or Vercel headers)
- [ ] Admin routes check `session.user.role === "ADMIN"` (already implemented)

### Monitoring

- [ ] Set up Vercel Analytics (Project → Analytics)
- [ ] Set up error monitoring (Sentry, Logtail, or similar)
- [ ] Set up database monitoring (Neon dashboard or AWS RDS monitoring)
- [ ] Configure uptime monitoring (Better Uptime, Pingdom, etc.)

### Backups

| Data | Frequency | Method |
|------|-----------|--------|
| PostgreSQL | Daily | Neon automatic backups / `pg_dump` cron |
| S3 images | — | AWS S3 versioning + cross-region replication |

### Performance

- [ ] Enable ISR (Incremental Static Regeneration) for public pages
- [ ] Configure CDN caching for S3 images (CloudFront recommended)
- [ ] Add image optimization via `next/image` with S3 remote patterns (already configured in `next.config.js`)
- [ ] Prisma connection pooling with `pgBouncer` for serverless

### Scaling Considerations

| Bottleneck | Solution |
|------------|----------|
| Database connections | Use Neon or Supabase with connection pooling |
| Image uploads | S3 direct upload presigned URLs (already implemented) |
| Auth rate limiting | Vercel WAF or custom middleware |
| Feed performance | Add pagination (cursor-based), consider Prisma `take`/`skip` |
| Leaderboard | Add caching or materialized view |

---

## Available Scripts

```bash
npm run dev                  # Development server
npm run build                # Production build
npm run start                # Start production server
npm run lint                 # Run ESLint
npm run db:generate          # Generate Prisma client
npm run db:migrate           # Apply migrations
npm run db:push              # Push schema (dev)
npm run db:reset             # Reset database (dev only)
npm run db:studio            # Open Prisma Studio
npm run admin:create         # Seed admin user
npm run test:critical        # Run critical tests
```

---

## File Structure

```
├── app/
│   ├── (auth)/              # Public auth pages (login)
│   ├── (protected)/         # Authenticated pages
│   │   ├── admin/           # Admin dashboard
│   │   ├── communities/     # Community pages
│   │   ├── feed/            # Main feed
│   │   ├── create-post/     # Create post
│   │   ├── leaderboard/     # Points leaderboard
│   │   └── profile/         # User profiles
│   ├── api/                 # API routes (auth, posts, communities, admin)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn components
│   ├── layout/              # Navbar, ThemeProvider
│   ├── posts/               # PostCard, CreatePostForm
│   └── communities/         # CommunityCard
├── lib/                     # Business logic (auth, prisma, s3, utils)
├── prisma/schema.prisma     # Database schema
├── scripts/                 # Admin creation, DB reset
├── tests/                   # Critical path tests
├── types/                   # TypeScript type extensions
├── public/                  # Static assets (robots.txt, icons, OG image)
└── scratch/policies/        # AWS IAM and bucket policy templates
```

---

## Troubleshooting

### Build fails with TypeScript errors
- Check for type mismatches (pre-existing `likes.type` issue in `communities/[slug]/page.tsx`)
- Run `npx tsc --noEmit` to debug

### Auth not working
- Verify `AUTH_SECRET` is set
- Verify `AUTH_URL` matches the deployment URL
- Check that `[...nextauth]/route.ts` imports `handlers` correctly
- Check server logs for `[auth][error]` messages

### Image uploads failing
- Verify AWS credentials in environment variables
- Check S3 bucket CORS configuration
- Ensure IAM user has s3:PutObject permission

### Email not sending
- Check SMTP credentials
- For Gmail: ensure 2FA is enabled and App Password is used
- Check SMTP_PORT and SMTP_SECURE values

### Prisma connection issues
- Verify `DATABASE_URL` is correct
- For Neon: use pooled connection with `?sslmode=require`
- For serverless: ensure connection pool limit is sufficient
