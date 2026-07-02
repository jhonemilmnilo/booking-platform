# Project Rules: Supabase Egress Optimization

These rules must be strictly followed when writing database schema, server actions, api routes, or frontend queries to ensure our Supabase free-tier egress stays well within limits.

## 1. Query Select Restrictions
- **No `SELECT *` allowed**: Never fetch entire records. Always use Prisma's `select` block to define only the fields needed for the current UI.
- **Relational Joins Limit**: Avoid deep nested relations (`include`) unless absolutely necessary. Destructure or query separately only when required.

## 2. Next.js Data Fetching & Caching
- **SSG / ISR for Public Pages**: Public pages (Landing Page, Room Showcases, Amenities, Gallery) must use Next.js static rendering or Incremental Static Regeneration (ISR). 
- **Database Query Bypass**: Client visits must hit Vercel's edge cache. Database requests should only trigger on page builds or revalidation intervals, consuming **0 database egress** during standard traffic spikes.

## 3. Storage & Image Assets
- **Next Image Optimization**: Always wrap Supabase Storage URLs inside Next.js `<Image />` component. This serves the image from Vercel's optimized image optimization edge CDN instead of downloading raw binaries from Supabase storage on every render.
- **Max Upload Limit**: Limit image uploads strictly to **5MB** (validated on client and server before upload).

## 4. DB Denormalization Law
- **Record Static States**: When saving transactions (e.g., Bookings), copy small, static values (like `roomName`, `pricePerNight`) directly into the transaction record instead of querying relationships. This eliminates the need for database joins when displaying lists.

## 5. Pagination
- **Infinite Scroll / Pagination**: All admin dashboards, transaction logs, and guest list tables must implement server-side pagination (limit to 10-25 items per page) to prevent loading large tables in a single payload.

## 6. Realtime & Webhook Restrictions
- **No Database Polling**: Use webhook listeners (like PayMongo webhooks) or immediate Server Action responses for transitions. Do not run interval-based database polling.
- **Use Supabase Realtime Sparingly**: Do not enable realtime listeners globally. Only enable them on tables where instantaneous UI updates are critical (like an active dashboard queue).

## 7. Authentication & Registration Flow
- **Social Login Pre-Registration Requirement**: If a user signs in via Google or Facebook but they do not have an existing user record in our `prisma.user` table, the system must abort the login, sign them out, and direct them to the sign-up page with a message stating they must register/sign up first. Do not auto-register users.
- **Enforced OTP Verification**: All authentication flows (both standard credentials and social logins) must be validated with an **8-digit OTP** sent to their email.

## 8. Logging Rules & Security
- **No Sensitive Log data**: Do not print or write passwords, OAuth access tokens, session keys, or personal identifying information (PII) in console logs.
- **Intentional Error Catching**: Always place error logs inside `catch (error)` statements for all database operations, third-party integrations (PayMongo, SMTP, Supabase calls), and authentication helpers to guarantee error-tracing capabilities in production.
- **Log Noise Reduction**: Do not include redundant console log statements for standard UI components, hover actions, or loop renders. Use logs exclusively for critical process flows, warnings, and system errors.
