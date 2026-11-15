# Charvi Technologies and Services (Charvi Solar) — Setup & Administrator Guide

## 1. Architecture Overview
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + `@vis.gl/react-google-maps`
- **Backend Server (`server.ts`)**: Express server serving Vite middleware in development, compiled static assets (`dist/`) in production, `/api/enquiries/notify` (rate-limited with honeypot spam trap & optional email webhook), authenticated `/api/media/upload` & `DELETE /api/media/file`, `/sitemap.xml`, and `/robots.txt`.
- **Database & Auth**: Firebase Firestore + Firebase Authentication (Google Sign-In) with security rules enforced in `firestore.rules`.

---

## 2. Environment Variables
Configure secrets via `.env` (for local development) or platform secrets (never commit `.env` to git):
- `GEMINI_API_KEY`: Server-side key if any optional AI utility is enabled later.
- `APP_URL`: Canonical public URL (used for `sitemap.xml` and `robots.txt`).
- `VITE_GOOGLE_MAPS_API_KEY` (or `GOOGLE_MAPS_API_KEY`): Google Maps JavaScript API key for branch maps in Meerut and Aligarh.
- `ENQUIRY_WEBHOOK_URL` *(optional)*: HTTPS webhook URL (e.g., Google Apps Script / Zapier / Formspree / custom mailer) triggered whenever a customer submits a quote or site survey enquiry to notify `charvisolarenergy@gmail.com`.

---

## 3. Firestore Database & Security Rules
- The Firestore schema is documented in `firebase-blueprint.json` and enforced by `firestore.rules`.
- **Public collections** (`branches`, `products`, `reviews`, `faqs`, `projects`, `media`, `settings`): Readable publicly for published items; writable **only** by verified administrators.
- **Private collections** (`enquiries`, `admin_users`, `admin_logs`):
  - `enquiries`: Public `create` only with schema validation; `read`, `update`, and `delete` restricted strictly to verified admins.
  - `admin_users` & `admin_logs`: Admin read/write only.
- To deploy updated rules manually:
  ```bash
  firebase deploy --only firestore:rules
  ```

---

## 4. Administrator Account & Access Control
1. Navigate to `/admin/login`.
2. **Two-Step Restricted Login**:
   - **Step 1 (Email Verification)**: Only `charvisolarenergy@gmail.com` is permitted. Any other email is rejected before the password field is shown.
   - **Step 2 (Password)**: Enter the configured administrator password.
3. **Enabling Live Firestore Sync for Email/Password in Firebase Console**:
   - Open [Firebase Console](https://console.firebase.google.com/) → Select project `gen-lang-client-0535661787`.
   - Go to **Authentication → Sign-in method → Add new provider → Email/Password** and enable it.
   - Go to **Authentication → Users → Add user**, add `charvisolarenergy@gmail.com` with the exact same password.
   - Sign in at `/admin/login` and click **Send Verification Email** in the dashboard banner (then click the link sent to `charvisolarenergy@gmail.com`) so `email_verified` becomes `true` for Firestore security rules.

---

## 5. First-Run Admin Checklist (Important!)
1. **Update Meerut Verified Street Address**:
   - Open **Admin Dashboard → Branches → Meerut Branch**.
   - Replace `[VERIFIED COMPLETE MEERUT OFFICE ADDRESS PENDING — UPDATE IN ADMIN]` with the verified complete street address, confirm coordinates (`lat`/`lng`), and check **"Verified Street Address"**.
2. **Upload Authentic Project Photos & Customer Reviews**:
   - All photographs uploaded in **Media Library** and attached in **Projects** are prioritized on the public website.
   - Only publish customer reviews with genuine customer confirmation in the **Reviews** module.
3. **Verify Subsidy & Calculator Assumptions**:
   - Review **Subsidy & Calc** settings periodically if MNRE / PM Surya Ghar or UP State (UPNEDA) guidelines change.

---

## 6. Local Development & Production Deployment
### Development
```bash
npm install
npm run dev
```
Server runs on port `3000`.

### Production Build & Start
```bash
npm run build
NODE_ENV=production npm start
```

### Recommended Backup Strategy
- **Firestore**: Enable scheduled Google Cloud Firestore automated exports to a Cloud Storage bucket (`gcloud firestore export gs://<bucket-name>`).
- **Uploaded Media (`/uploads`)**: Persist the `/uploads` directory on a durable volume or sync periodically to cloud object storage if deploying to ephemeral containers.
- **Lead CRM Backups**: Regularly download CSV exports from **Admin Dashboard → Lead CRM → Export CSV**.
