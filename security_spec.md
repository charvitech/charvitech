# Firestore Security Specification — Charvi Technologies and Services

## 1. Data Invariants
- Public users may read published portfolio projects (`published == true`), published products (`published == true`), published reviews (`published == true`), published FAQs (`published == true`), branch directory, media metadata, and site/subsidy/SEO settings.
- Public users may ONLY `create` new enquiries in `/enquiries/{enquiryId}` with initial `status == 'New'`, bounded strings, valid schema keys, and server timestamp (`createdAt == request.time && updatedAt == request.time`).
- Public users may NEVER read, list, update, or delete `/enquiries/{enquiryId}` (prevents PII leakage of customer phone numbers and emails).
- Administrative writes across `/settings`, `/branches`, `/projects`, `/products`, `/reviews`, `/faqs`, `/media`, `/admin_users`, `/admin_logs`, and all reads/updates/deletes on `/enquiries` require `isAdmin()`, which checks `request.auth != null && request.auth.token.email_verified == true` and either a verified bootstrapped admin email (`charvitechnologiesandservices@gmail.com` or `charvisolarenergy@gmail.com`) or an active document in `/admin_users/$(request.auth.uid)`.

## 2. The "Dirty Dozen" Attack Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated read of `/enquiries` (`list` or `get`)** — blocked because `allow read: if isAdmin()`.
2. **Unauthenticated `create` on `/enquiries` with `status: "Converted"`** — blocked because public create enforces `status == 'New'`.
3. **Shadow field injection (`isAdmin: true`) on `/enquiries` create** — blocked by `data.keys().hasOnly(...)`.
4. **Oversized 10KB `message` or `id` string on `/enquiries` create** — blocked by `isValidId(enquiryId)` and `size() <= 2000`.
5. **Backdated `createdAt` timestamp on `/enquiries` create** — blocked by `incoming().createdAt == request.time`.
6. **Spoofed admin email with `email_verified: false`** — blocked by `request.auth.token.email_verified == true`.
7. **Non-admin authenticated user reading `/projects` where `published == false`** — blocked by `resource.data.published == true || isAdmin()`.
8. **Non-admin authenticated user creating or updating `/settings/subsidy`** — blocked by `isAdmin()`.
9. **Non-admin user writing themselves into `/admin_users/{uid}`** — blocked by `isAdmin()`.
10. **Non-admin user reading `/admin_logs`** — blocked by `isAdmin()`.
11. **Admin updating `/enquiries` with invalid `status` enum (e.g. `"Hacked"`)** — blocked by `isValidEnquiry(incoming())`.
12. **Unauthenticated `delete` on `/projects/{projectId}`** — blocked by `isAdmin()`.
