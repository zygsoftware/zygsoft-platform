# ZYGSOFT — Production Deployment Checklist

This document is the single reference for deploying the ZYGSOFT platform to a production server. Work through each section in order on a fresh deployment.

---

## 1. Environment Variables

Copy `.env.example` to `.env` (or set variables in your hosting control panel) and fill in **every** required value.

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Full canonical URL, e.g. `https://zygsoft.com` — no trailing slash |
| `DATABASE_URL` | **Yes** | SQLite: `file:./dev.db`. For PostgreSQL: `postgresql://user:pass@host/db` |
| `PRISMA_CLIENT_ENGINE_TYPE` | Production-dependent | Set to `binary` on cPanel / shared Node.js hosting |
| `NEXTAUTH_SECRET` | **Yes** | Run `openssl rand -base64 32` to generate a unique secret |
| `NEXTAUTH_URL` | **Yes** | Must match the production domain exactly, e.g. `https://zygsoft.com` |
| `SMTP_HOST` | Recommended | Leave blank to silently skip email sending — contact submissions still save to DB |
| `SMTP_PORT` | Recommended | `465` for SSL, `587` for STARTTLS |
| `SMTP_SECURE` | Recommended | `true` for port 465 |
| `SMTP_USER` | Recommended | Mailbox username / email address |
| `SMTP_PASS` | **Secret** | Mailbox password — never commit this to version control |
| `CONTACT_TO_EMAIL` | Recommended | Recipient of contact form notifications (default: `info@zygsoft.com`) |
| `CONTACT_FROM_EMAIL` | Recommended | Sender address shown in the email From header |
| `UDF_MICROSERVICE_URL` | **Yes** (for UDF tool) | URL of the running Python FastAPI microservice, e.g. `http://127.0.0.1:8000` |
| `ADMIN_RESET_SECRET` | **Leave blank** | Only set temporarily for emergency admin reset; delete immediately after use |
| `ADMIN_RESET_PASSWORD` | **Leave blank** | Only set alongside `ADMIN_RESET_SECRET`; minimum 12 characters |

> **Critical:** `ADMIN_RESET_SECRET` / `ADMIN_RESET_PASSWORD` must be **unset** in normal production. The `/api/reset-admin` route returns 404 when the secret is absent, which is the safe default state.

> **Critical:** `NEXTAUTH_SECRET` must be a fresh random value — never reuse the development placeholder string.

---

## 2. Database Setup

### SQLite (default / single-server)

SQLite is the default. It works well for a single-server deployment with low-to-medium traffic.

```bash
# Apply schema and generate Prisma client
npx prisma db push
npx prisma generate

# Seed initial products, blog posts, and portfolio projects
node prisma/seed.js
```

### Production notes

- **Back up `dev.db`** (or your production DB file) regularly — it contains all users, payments, blog posts, support tickets, and contact messages.
- Run `npx prisma db push` (not `migrate dev`) after schema changes to avoid data loss on SQLite.
- For high-traffic or multi-instance deployments, migrate to PostgreSQL: update `DATABASE_URL` and change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`. The Prisma adapter import in `src/app/api/auth/[...nextauth]/route.ts` and `src/app/api/reset-admin/route.ts` will also need to be updated from `PrismaBetterSqlite3` to the PostgreSQL adapter.
- **SQLite has no built-in connection pooling.** Under sustained concurrent write load it will become a bottleneck. For anything beyond a single-user or lightly-trafficked site, plan a PostgreSQL migration before launch.

---

## 3. First Admin Account

> ⚠️ **This is the most common post-deploy security gap. Do not skip this step.**

The `seed-admin.js` script creates the first admin user. By default it uses a well-known password.

**Recommended approach — supply a strong password at creation time:**

```bash
ADMIN_INITIAL_PASSWORD='YourStrongPassword123!' node seed-admin.js
```

**If you used the default password:**

1. Log in at `/admin/login` with `admin@zygsoft.com` / `Zygsoft2024!`
2. Immediately navigate to `/admin/dashboard` and change the password (or use the `/api/reset-admin` route with a temporary secret to force a reset)
3. Remove or unset `ADMIN_RESET_SECRET` / `ADMIN_RESET_PASSWORD` after the reset

**The default credential `Zygsoft2024!` is documented in this repository and must not remain active on any internet-facing production server.**

---

## 4. SMTP / Email Notifications

The contact form saves submissions to the database regardless of SMTP status. Email notifications are a secondary convenience layer.

### Verify SMTP is working

```bash
# Quick test — send a test email from Node.js:
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
t.sendMail({ from: process.env.CONTACT_FROM_EMAIL, to: process.env.CONTACT_TO_EMAIL,
  subject: 'ZYGSOFT SMTP Test', text: 'SMTP is working.' })
  .then(() => console.log('OK'))
  .catch(e => console.error('FAILED', e.message));
"
```

### Checklist

- [ ] `SMTP_HOST` is set and the mailbox is reachable from the server
- [ ] SPF record for the sending domain includes your mail server
- [ ] DKIM is configured for the sending domain (verify with [mail-tester.com](https://www.mail-tester.com))
- [ ] Test contact form submission → check inbox at `CONTACT_TO_EMAIL`
- [ ] Verify that a submission still saves to DB even if the SMTP call fails (it will — email errors are caught server-side and do not affect the 201 response)

---

## 5. UDF Microservice

The `/dashboard/tools/doc-to-udf` tool requires a separate Python FastAPI process.

```bash
cd tools/udf-converter
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

- Set `UDF_MICROSERVICE_URL=http://127.0.0.1:8000` in `.env`.
- Run with PM2 or a `systemd` unit for automatic restarts.
- The microservice should **not** be publicly accessible — bind it to `127.0.0.1` only.

---

## 6. Build and Start

```bash
npm install
npx prisma generate      # regenerate Prisma client after fresh install
npm run build            # creates .next production build
npm start                # starts the Next.js production server on port 3000
```

For process management:

```bash
npm install -g pm2
pm2 start "npm start" --name zygsoft
pm2 save && pm2 startup
```

---

## 7. HTTPS / Reverse Proxy (Nginx)

All production traffic must be served over HTTPS.

```nginx
server {
    listen 443 ssl http2;
    server_name zygsoft.com www.zygsoft.com;

    # SSL certificate (Let's Encrypt / Certbot recommended)
    ssl_certificate     /etc/letsencrypt/live/zygsoft.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zygsoft.com/privkey.pem;

    # Allow large file uploads for tool APIs (image-to-pdf, pdf-merge, payment receipts)
    client_max_body_size 55M;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name zygsoft.com www.zygsoft.com;
    return 301 https://$host$request_uri;
}
```

> **Note:** `X-Forwarded-For` must be set correctly by your proxy — the application's IP-based rate limiter (`src/lib/rate-limit.ts`) reads this header to identify clients. Without it, all requests will appear to come from `127.0.0.1` and share the same rate limit bucket.

---

## 8. Rate Limiting

The following public/customer POST endpoints have **in-memory IP-based rate limiting** built in:

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/contact` | 5 requests | per 10 minutes per IP |
| `POST /api/auth/register-customer` | 3 requests | per 60 minutes per IP |
| `POST /api/support` | 10 requests | per 60 minutes per IP |

> ⚠️ **Single-instance only.** The rate limiter stores state in process memory. On multi-instance / PM2 cluster deployments each worker maintains its own counters independently. For multi-instance production, replace `src/lib/rate-limit.ts` storage with a shared Redis layer (e.g. `@upstash/ratelimit`).

---

## 9. OG / Social Preview Image

The default Open Graph image `/public/og-default.png` (1200×630) is included in the repository. It is used as the social preview fallback for all pages that do not have a dedicated image.

If you want to replace it with a custom-designed image:
- Replace `/public/og-default.png` with your 1200×630 PNG
- No code changes are needed — all metadata references point to this path

---

## 10. Security Checklist

- [ ] `NEXTAUTH_SECRET` is a cryptographically random 32+ byte string (not the development placeholder)
- [ ] `ADMIN_RESET_SECRET` is **not set** in `.env` (or is deleted after emergency use)
- [ ] Admin default password `Zygsoft2024!` has been **changed** after first login
- [ ] No hardcoded credentials remain in source code — run `git grep -r "password\|secret"` before commit
- [ ] `SMTP_PASS` is in `.env` and `.env` is listed in `.gitignore` (it is: `.env*`)
- [ ] SQLite `dev.db` is **not** served as a static asset — confirm Nginx blocks direct access to `.db` files
- [ ] `NODE_ENV=production` is set — this enables stricter behaviour in several APIs (e.g. unpublished blog posts return 404)
- [ ] HTTP → HTTPS redirect is active
- [ ] `X-Forwarded-For` header is correctly forwarded by the reverse proxy

---

## 11. Post-Deploy Smoke Tests

Run these manually after every fresh deployment:

- [ ] Homepage loads at `https://zygsoft.com`
- [ ] `/tr` and `/en` locale routing resolves correctly
- [ ] Admin login works at `/admin/login` with updated credentials
- [ ] Create a test blog post in `/admin/blog` → verify it appears at `/blog/[slug]`
- [ ] Submit the public contact form → verify `ContactMessage` row in DB; verify email if SMTP is configured
- [ ] Register a new customer account at `/register`
- [ ] Log in as customer → check dashboard overview, services, billing, support tabs all render
- [ ] Upload a test payment receipt as customer → verify it appears in `/admin/payments`
- [ ] Create a support ticket as customer → verify it appears in `/admin/support`
- [ ] Test the image-to-PDF tool (upload a JPG → download PDF)
- [ ] Test the PDF merge tool (upload two PDFs → download merged PDF)
- [ ] If UDF microservice is running: test the doc-to-udf tool
- [ ] Verify `/sitemap.xml` is accessible and includes service, blog, and portfolio URLs
- [ ] Verify `/robots.txt` is accessible
- [ ] Check OG preview for the homepage using [opengraph.xyz](https://www.opengraph.xyz) or similar
- [ ] Run [PageSpeed Insights](https://pagespeed.web.dev/) on the homepage
- [ ] Check Google Rich Results Test for structured data (Organization, Service, BlogPosting, Product)

---

## 12. Remaining Known Concerns

| Area | Status | Notes |
|---|---|---|
| Rate limiting (multi-instance) | ⚠️ In-memory only | Replace with Redis for multi-worker / serverless deployments |
| SQLite under write concurrency | ⚠️ Limited | Migrate to PostgreSQL for high-traffic or multi-instance setups |
| UDF microservice supervision | Manual | Ensure PM2 / systemd restarts it on crash |
| Email deliverability | Depends on SMTP config | Test SPF/DKIM alignment with [mail-tester.com](https://www.mail-tester.com) |
| Admin password | ⚠️ Default known | Must be changed immediately after first production login |
| `p1.png`, `p2.png`, `p3.png` in `/public/images/` | Present | Confirm these are the intended portfolio preview images, not leftover test assets |
