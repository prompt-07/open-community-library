# Open Library — Step-by-Step Build Guide (Typical MVP, Opus 4.8)

Source requirements: `Open_Library_Full_Requirements_Document.docx` (functional spec) + `Give me a doc file of the above, mention everythin....pdf` (System Design & UI/UX Style Guide — supersedes/extends the first doc on design details).
Scope: **Typical MVP** — functional core (browse/search, reservations-as-cart, lending, reviews, admin) + the full UI/UX style guide (theme, typography, accessibility widget, page layouts) from the second doc.
Model: Claude Opus 4.8, used inside Claude Code.

---

## Changelog — v2 (merged with the System Design & UI/UX doc)

The second doc left three architectural choices open ("X or Y"). Confirmed decisions, so later phases don't re-litigate them:

| Decision point | Doc offered | **Chosen** | Why |
|---|---|---|---|
| Database | PostgreSQL or MongoDB | **MongoDB** | Phase 2 schemas already designed around it; no rework |
| Frontend framework | React.js or Next.js | **React + Vite (SPA)** | No SEO-critical pages here; SSR would be pure added complexity |
| Auth | OTP/SMS or JWT | **JWT (email+password)** | No SMS-gateway cost/integration for a volunteer-run site |
| Styling | (doc states Tailwind CSS directly, not a choice) | **Tailwind CSS** | Adopted as specified — good fit for the theming/accessibility requirements below |

New from the style guide, folded into the phases below (not a separate track):
- Exact accessibility numbers (18px body text, 48–52px buttons, 24–36px headings)
- One fixed site theme — **Theme 1: Warm Parchment & Deep Slate** (the doc marks it "Recommended") — plus a separate, always-available **High-Contrast toggle** (these are two different things: theme = the one look you ship; high-contrast = a runtime accessibility override on top of it)
- Floating accessibility widget: 3-level Font Scaler (A-/A+/A++), High-Contrast toggle, Language toggle
- Bilingual status badges (color + icon + text)
- Homepage gets real content: Hero Banner, "Book of the Week", public Impact Stats Bar
- Book Detail page gets **orientation tags** on the admin review, and the "lent out" block now shows an **expected return date** and only the borrower's **name/initial** (privacy — not full contact info)
- Reservation flow is explicitly a **cart**: add multiple books, confirm together, limit enforced per session (2–3 books)
- Admin Lending Log gains **email** and **address/society** fields
- Admin gets a distinct **Session Fulfillment Desk** export (who's picking up what at the next session) alongside the general reports export
- Genre list changed: **added** Sociology, Fiction; **removed** Economics, Spirituality, Science
- Language values now **three-way**: Marathi, Hindi, English (was Marathi/English)

Phase numbering below is a clean renumbering from v1 — if you already built against the old phase numbers, diff this file against your repo state before continuing (don't assume old Phase N = new Phase N).

---

## 0. How to use this guide (read this first)

This guide exists to stop an agent from **hallucinating** (inventing APIs, skipping verification, jumping ahead to unbuilt features, silently drifting from the schema) while building a real app over many sessions. The method:

1. **One phase per work session.** Never ask Claude to "build the whole app" in one prompt — that's exactly what causes drift and invented code. Each phase below is scoped to one deliverable.
2. **Verify before moving on.** Every phase ends with a concrete, runnable check (a command, a curl call, a browser action). Don't start the next phase until the current one's checklist passes. If it fails, fix it in the *same* phase — don't paper over it by moving forward.
3. **Commit after each verified phase.** `git commit` gives you a rollback point. If a later phase goes sideways, you can `git diff`/`git reset` back to the last known-good phase instead of arguing with the model about what changed.
4. **Feed this file to Claude as context, not as a memory.** At the start of each phase's session, tell Claude to read this file and the relevant phase only. Don't summarize the whole guide from memory turn after turn — re-read it so the acceptance criteria and exact hex codes/copy strings stay exact.
5. **Anything the model can't verify, it should say so — not guess.** If a package version, API shape, field name, or exact color/copy string isn't visible in your actual `package.json` / actual file / this guide, the instruction is: check the real source, don't recall it from training data.

### The guardrail block — paste this at the start of every phase prompt

```
Before writing any code:
- Read the actual current contents of the files you're about to touch. Don't assume their contents from earlier turns.
- Check package.json / node_modules for the exact installed version of any library you use. Don't invent method
  names or options from a version you remember — if unsure, check the installed package's README or types.
- Use exact hex codes, copy strings, and field names from this guide — don't approximate or paraphrase them.
- Do not implement anything beyond this phase's stated scope, even if it seems like an obvious next step.
- After implementing, run the verification command(s) for this phase yourself and paste the actual output.
  Do not claim something works without having run it.
- If something in this phase depends on a decision made in an earlier phase (a field name, a route path, a
  schema, a color token), use the exact name/value from that phase's actual code — grep for it, don't guess.
Phase to implement: <PHASE NUMBER AND NAME>
Acceptance criteria: <paste the "Definition of done" list from that phase>
```

### Definition-of-done gate (apply to every phase, not just the ones that mention it explicitly)

- [ ] Code runs without errors (`npm run dev` / equivalent starts cleanly)
- [ ] The phase's verification steps pass, and you saw the actual output (not "should work")
- [ ] No field/route/env-var appears in code that doesn't also appear in the schema/route table it belongs to
- [ ] Colors, copy strings, and sizes match this guide's exact values — not a close approximation
- [ ] `git status` shows only the files this phase should have touched
- [ ] Committed with a message referencing the phase number

---

## 1. Prerequisites (do this once, before Phase 0)

- Node.js LTS installed (`node -v` to confirm — use whatever current LTS is; don't hardcode a version number here, verify what you actually have)
- A MongoDB Atlas account (free M0 cluster) — get a connection string
- A Cloudinary account (free tier) — get cloud name, API key, API secret
- Git installed, GitHub repo created (empty)
- Accounts for later deployment: Vercel, Render (can be created at the deployment phase, not needed earlier)

Create a project root with two folders: `server/` (Express API) and `client/` (React app). Initialize git at the root.

---

## Design reference (pull from here in every UI phase — don't re-derive or approximate)

### Fixed site theme — Warm Parchment & Deep Slate

| Token | Hex | Use |
|---|---|---|
| Primary text/headers | `#1E293B` (Deep Ink Navy) | Body/heading text |
| Accent / CTA | `#C2410C` (Warm Terracotta) — `#B45309` acceptable alt | Primary buttons ("Reserve", "Add to Cart"), active nav tabs |
| Page background | `#FDFBF7` (Warm Parchment) — `#F8F6F0` acceptable alt | Page backdrop |
| Cards/modals | `#FFFFFF` | Card/modal surfaces over the parchment background |
| Available status | `#15803D` (Forest Green) | Availability badge |
| Lent-out status | `#B91C1C` (Warm Crimson) | Unavailable badge |

Implement as Tailwind theme tokens (`tailwind.config` extend, or CSS custom properties consumed by Tailwind) — not hardcoded hex strings scattered through components.

### High-Contrast mode (separate runtime toggle, not a theme choice)

When enabled: jet-black text (`#000000`) on white or yellow (`#FFFF00`) background, overriding the above tokens site-wide. Implement as a `data-contrast="high"` attribute on `<html>` with a CSS override block — not a duplicate set of components.

### Typography

- English headings: `Merriweather`, `Lora`, or `Playfair Display` (serif) — pick one, use consistently
- English body/controls: `Inter`, `Plus Jakarta Sans`, or `Roboto` (sans) — pick one, use consistently
- Marathi/Hindi (Devanagari): `Noto Sans Devanagari` or `Mukta`
- Sizes: body text minimum `18px`/`1.125rem`; headings `24px`–`36px`, bold
- Buttons: minimum height `48px`–`52px`, generous padding, explicit text labels — never icon-only (e.g. "Request This Book for Next Session", not just a cart icon)

### Status badge copy (bilingual, color + icon + text — never color alone)

| State | Copy |
|---|---|
| Available | 🟢 Available \| उपलब्ध |
| Lent out | 🔴 Lent Out \| उसने दिलेले |

### Genres (enum — use exactly this list, nothing more/less)

History, Politics, Philosophy, Biography, Literature, Self-help, Sociology, Fiction, Children, Novels

### Languages (book field + filter values)

Marathi, Hindi, English

---

## Phase 0 — Repo scaffolding & guardrail files

**Goal:** empty-but-runnable skeleton, plus the config that keeps later phases honest.

**Do:**
- `git init`, `.gitignore` (node_modules, .env, dist/build)
- `server/`: `npm init`, install `express`, `mongoose`, `dotenv`, `cors`. Create `server/src/index.js` with a single `GET /health` route returning `{status: "ok"}`.
- `client/`: scaffold with Vite React template. Leave default starter page.
- Root-level `README.md` stating: stack, how to run both apps locally, and a link back to this guide.
- `.env.example` in `server/` listing required vars (`PORT`, `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`) with placeholder values only — never real secrets committed.

**Definition of done:**
- [ ] `cd server && npm run dev` (or `node src/index.js`) starts and `curl localhost:<port>/health` returns `{"status":"ok"}`
- [ ] `cd client && npm run dev` starts and the default Vite page loads in a browser
- [ ] `.env` is git-ignored; `.env.example` is committed with no real secrets

**Commit:** `chore: scaffold server and client, health check`

---

## Phase 1 — MongoDB connection

**Goal:** backend actually talks to your Atlas cluster.

**Do:** Add Mongoose connection logic in `server/src/index.js` (or a `db.js` it imports), reading `MONGO_URI` from `.env`. Log connection success/failure explicitly (don't let a failed connection silently continue serving requests).

**Definition of done:**
- [ ] On `npm run dev`, console shows an explicit "MongoDB connected" line
- [ ] Killing the connection string (wrong password, temporarily) produces a visible error, not a silent hang
- [ ] `.env` (with real Atlas URI) is loaded correctly and is not committed

**Commit:** `feat: connect Express server to MongoDB Atlas`

---

## Phase 2 — Data models

**Goal:** every schema the rest of the app depends on, defined once, correctly, so later phases reference real field names instead of inventing them.

**Models (Mongoose schemas in `server/src/models/`):**

- **User** — name, email (unique), passwordHash, phone, role (`member`/`admin`), wishlist (array of Book refs), createdAt
- **Book** — title, author, language (enum: Marathi/Hindi/English), genre (enum — the 10-item list in the Design Reference above), coverImageUrl, description, adminReview, **orientationTags** (array of strings, e.g. `["Thought-Provoking", "Beginner Friendly"]`), **isBookOfWeek** (boolean, default false), ratingAverage, ratingCount, totalCopies, availableCopies, shelfNumber (optional)
- **Reservation** — book ref, member ref, status (`pending`/`approved`/`collected`/`cancelled`), **sessionDate** (the upcoming session this reservation is for), createdAt
- **Loan** (lending record) — book ref, member ref, **memberName, memberPhone, memberEmail, memberAddress** snapshot (Name/Phone/Email/Address-Society per the admin registration form), dateIssued, **expectedReturnDate**, dateReturned (nullable), remarks
- **WaitingListEntry** — book ref, member ref, createdAt
- **Review** — book ref, member ref, rating (1–5), text, createdAt

**Do:** write the schemas, export models, write one throwaway seed script (`server/src/seed.js`) that inserts 3–5 sample books (covering a few different genres/languages, one flagged `isBookOfWeek: true`) and one admin user, run it once against your Atlas cluster.

**Definition of done:**
- [ ] `node src/seed.js` runs without error and you can see the inserted documents in Atlas (or via `mongosh`)
- [ ] Every field named in this phase exists in the schema exactly as spelled here — later phases must grep this file rather than re-guess field names
- [ ] Genre/language enums match the Design Reference list exactly (no leftover Economics/Spirituality/Science, no missing Sociology/Fiction/Hindi)
- [ ] No extra/invented fields beyond what's listed (add real ones later, in the phase that needs them, not preemptively)

**Commit:** `feat: define core Mongoose models and seed script`

---

## Phase 3 — Auth (JWT)

**Goal:** register/login, password hashing, protected-route middleware. (OTP/SMS login was considered and explicitly deferred — see Changelog.)

**Do:**
- `POST /api/auth/register` — name, email, password, phone → hash password with `bcrypt`, create User with role `member`
- `POST /api/auth/login` — email, password → verify hash, issue JWT (short-lived access token; store in httpOnly cookie, not localStorage)
- `authMiddleware` — verifies JWT from cookie, attaches `req.user`
- `adminOnly` middleware — checks `req.user.role === 'admin'`
- One protected test route (`GET /api/auth/me`) returning the current user

**Definition of done:**
- [ ] `curl` register → 201, user exists in DB with hashed (not plaintext) password
- [ ] `curl` login with correct credentials → 200 + cookie set; wrong password → 401
- [ ] `curl /api/auth/me` without cookie → 401; with cookie → returns correct user
- [ ] Manually confirm in DB that `passwordHash` is not the plaintext password

**Commit:** `feat: JWT auth (register, login, protected routes)`

---

## Phase 4 — Book catalog API (public browse/search + admin CRUD)

**Goal:** the read side the whole frontend catalog depends on, plus admin management.

**Do:**
- `GET /api/books` — supports query params: `search` (title/author/keyword text match), `language` (Marathi/Hindi/English), `genre` (the 10-item enum), `rating` (min), `available` (bool), pagination (`page`, `limit`)
- `GET /api/books/book-of-week` — the single book with `isBookOfWeek: true` (used by the homepage)
- `GET /api/books/:id` — single book detail, populate reviews, include `orientationTags`
- `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id` — admin-only (use `adminOnly` from Phase 3). Setting `isBookOfWeek: true` on one book must unset it on any other (only one at a time).

**Definition of done:**
- [ ] `curl` each filter combination individually and confirm results actually match the filter (e.g. `?genre=Sociology` returns only Sociology books)
- [ ] Non-admin JWT gets 403 on POST/PUT/DELETE; admin JWT succeeds
- [ ] Pagination params return the correct slice and a total count
- [ ] Flagging a second book as `isBookOfWeek` un-flags the first (only ever one true)

**Commit:** `feat: book catalog API — search, filter, admin CRUD, book of the week`

---

## Phase 5 — Reservation ("cart") API

**Goal:** the doc's explicit cart flow — select multiple books, confirm together for the next session, capped per session.

**Do:**
- `POST /api/reservations/confirm` (member) — accepts an array of book IDs, validates ALL of them have `availableCopies > 0`, validates the total against `MAX_RESERVATIONS_PER_SESSION` (env var, default 3) counting this member's already-`pending`/`approved` reservations for the upcoming session, creates one Reservation per book with a computed `sessionDate` (the next upcoming Sunday — write a small pure helper function for this, and unit-test it directly rather than only through the API)
- `GET /api/reservations/mine` (member) — their own reservations + status, grouped/sorted by `sessionDate`
- `GET /api/reservations` (admin) — all pending reservations, filterable by `sessionDate`
- `PATCH /api/reservations/:id/approve` / `/cancel` (admin)

**Definition of done:**
- [ ] Confirming a cart with one unavailable book in it rejects the whole request with a clear error naming which book
- [ ] Confirming beyond the per-session limit is rejected (test with the default limit of 3)
- [ ] `sessionDate` is always a Sunday, and always the *next* one relative to today (test on at least two different days of the week)
- [ ] Member sees only their own reservations; admin sees all
- [ ] Approving a reservation is reflected in `GET /api/reservations/mine` status

**Commit:** `feat: reservation cart API — multi-item confirm, per-session limit`

---

## Phase 6 — Lending + waiting list API

**Goal:** issue/return flow with the fuller registration fields, privacy-conscious public exposure, and the waiting-list button for unavailable books.

**Do:**
- `POST /api/loans/issue` (admin) — body includes memberName, memberPhone, memberEmail, memberAddress, dateIssued, expectedReturnDate, remarks; records the Loan, decrements `availableCopies`
- `POST /api/loans/:id/return` (admin) — sets `dateReturned`, increments `availableCopies`
- `GET /api/books/:id` (public) response, when `availableCopies === 0`, includes only: a first-name-plus-last-initial version of the current borrower (e.g. "Priya S.") and `expectedReturnDate` — **never** full name, phone, email, or address
- `POST /api/waiting-list` (member) — join waiting list for an unavailable book
- `GET /api/waiting-list/:bookId` (admin) — see who's waiting, with full member contact info (admin-only)

**Definition of done:**
- [ ] Issuing a book when `availableCopies === 0` is rejected
- [ ] Returning a book correctly increments `availableCopies` and sets `dateReturned`
- [ ] Waiting list join is rejected if the book is actually available (should reserve instead)
- [ ] Public `GET /api/books/:id` shows only initial + expected return date when lent out — write a test that asserts the full name/phone/email/address are absent from that specific response, not just present-but-unused elsewhere
- [ ] Admin waiting-list endpoint shows full contact info

**Commit:** `feat: lending (issue/return) and waiting list API`

---

## Phase 7 — Reviews & ratings API

**Goal:** member reviews, admin featured recommendation, rating rollup.

**Do:**
- `POST /api/books/:id/reviews` (member) — rating (1–5) + text; recompute `ratingAverage`/`ratingCount` on the Book
- `GET /api/books/:id/reviews` — list, newest first
- `PUT /api/books/:id/admin-review` (admin) — sets the featured `adminReview` text and `orientationTags` array on the Book

**Definition of done:**
- [ ] Submitting a review updates `ratingAverage` correctly (verify the math by hand on 2–3 sample reviews)
- [ ] A member can't submit more than one review per book (decide and enforce a rule — e.g. upsert instead of duplicate)
- [ ] Admin-review text and orientation tags only settable by admin

**Commit:** `feat: reviews, ratings, and admin orientation tags API`

---

## Phase 8 — Admin stats, public impact stats, and exports

**Goal:** every number the doc asks for, split correctly between public (homepage) and admin-only (dashboard).

**Do:**
- `GET /api/stats/public` (no auth) — `totalBooks`, `activeReaders` (members with at least one Loan ever — define this rule explicitly in code, don't leave it implicit), `booksIssuedToDate` (total count of all Loan records ever created, not just currently-active ones). This powers the homepage Impact Stats Bar.
- `GET /api/admin/stats` (admin) — total books, registered members, books currently issued, overdue books (define "overdue" — e.g. issued > 14 days past `expectedReturnDate` with no `dateReturned`, threshold as an env var)
- `GET /api/admin/session-fulfillment?sessionDate=...` (admin) — list of all `approved` reservations for a given session, grouped by member, with book titles — this is the "Session Fulfillment Desk" printable list, distinct from the general export below
- `GET /api/admin/export/loans.xlsx` (admin) — using `exceljs`, stream a workbook of loan records. Confirm the exact export API from its actual installed version's README before writing code.

**Definition of done:**
- [ ] Public stats endpoint requires no auth and returns real numbers matching a manual count against seeded/test data
- [ ] `activeReaders` count only includes members with ≥1 Loan — verify by hand against your seed data (a member with only a reservation, no loan, should NOT count)
- [ ] Session Fulfillment list for a given date only shows `approved` reservations for that exact `sessionDate`
- [ ] Downloaded `.xlsx` file actually opens in Excel/LibreOffice and contains real rows
- [ ] Overdue threshold is configurable, not hardcoded

**Commit:** `feat: public impact stats, admin stats, session fulfillment export`

---

## Phase 9 — Frontend design system: Tailwind, theme, typography, i18n, accessibility widget

**Goal:** the shell and design tokens every later UI phase inherits — get this right once so nothing downstream re-derives colors/sizes/copy.

**Do:**
- Install and configure Tailwind CSS in `client/`. Extend the theme config with the exact tokens from the Design Reference section above (don't inline hex codes in components).
- React Router setup: Home, Browse Books, Book Detail, Cart, My Reservations, Reviews, About Library, Admin Dashboard (route stubs are fine for now — just the shell + nav with the logo/nav links the doc specifies)
- `react-i18next` setup with three locale files (`en`, `mr`, `hi`)
- Import and apply the typography stack (headings font, body font, Devanagari font) as global styles
- Global button/heading/body-text size rules matching the Design Reference minimums (18px body, 48–52px buttons, 24–36px bold headings) — as Tailwind base/component classes, not per-page overrides
- Floating accessibility widget (fixed position, visible on every page): **Font Scaler** (A- / A+ / A++ — three discrete size steps, not a continuous slider), **High-Contrast toggle** (applies the `data-contrast="high"` override from the Design Reference), **Language toggle** (cycles/selects between en/mr/hi) — persist the user's choice in localStorage
- Reusable `<StatusBadge>` component implementing the bilingual copy + color + icon table from the Design Reference — used everywhere availability is shown, not re-implemented per page
- API client wrapper (`fetch`/`axios`) pointing at the backend, with cookie credentials included

**Definition of done:**
- [ ] All route stubs render without console errors, using the Warm Parchment & Deep Slate theme tokens (visually confirm background/accent colors match the hex codes)
- [ ] Font Scaler cycles through exactly 3 steps and visibly changes text size; High-Contrast toggle switches to jet-black-on-white/yellow; Language toggle changes visible nav text across all three locales
- [ ] All three settings persist across a page reload
- [ ] `<StatusBadge>` renders the exact bilingual copy strings from the Design Reference, not paraphrased text
- [ ] Zoom to 200% / resize to mobile width — layout doesn't break

**Commit:** `feat: design system — Tailwind theme, typography, i18n, accessibility widget`

---

## Phase 10 — Homepage

**Goal:** the doc's specific homepage content — this is new vs. a generic landing page.

**Do:**
- Hero Banner: bilingual welcome text (English + Marathi) with a prominent "Browse Books | पुस्तके पहा" button linking to `/browse`
- Featured "Book of the Week" card, wired to `GET /api/books/book-of-week` — shows cover, title, admin review preview, orientation tags
- Impact Stats Bar, wired to `GET /api/stats/public` — Total Books, Active Readers, Books Issued To Date, as live counters (real numbers, not hardcoded placeholders)

**Definition of done:**
- [ ] Book of the Week card shows the actual book you flagged in Phase 2's seed data
- [ ] Stats bar numbers match what `GET /api/stats/public` actually returns (open the network tab and compare)
- [ ] If no book is currently flagged as Book of the Week, the section degrades gracefully (no crash, no broken card)

**Commit:** `feat: homepage — hero banner, book of the week, impact stats`

---

## Phase 11 — Browse/Search page

**Goal:** wire the public catalog UI to the Phase 4 API, with the doc's specific filter-chip UI.

**Do:** Browse page with global search bar (title/author/keyword) and quick filter chips for Language (Marathi/Hindi/English), Genre (the 10-item list), and Availability (Show All vs. Available Only). Book grid: cover, bilingual title/author, rating stars, `<StatusBadge>`, "See Details" button. Calls the real `GET /api/books` endpoint with real query params — not mock data.

**Definition of done:**
- [ ] Typing a real search term returns real filtered results from your seeded DB
- [ ] Each filter chip, used alone and in combination, changes the results correctly — test at least one Hindi-language book to confirm the third language value actually works, not just Marathi/English
- [ ] Empty results state is handled (no crash, a clear "no books found" message, bilingual)

**Commit:** `feat: browse/search page with filter chips`

---

## Phase 12 — Auth pages + member profile

**Goal:** register/login UI, protected routing, profile page.

**Do:** Login/Register forms (call Phase 3 endpoints), route guard that redirects unauthenticated users away from member-only pages, Member Profile page showing name/phone/reading history/borrowed books/active reservations/wishlist/reviews written (pull from the real endpoints, not placeholders).

**Definition of done:**
- [ ] Register → login → land on an authenticated view, in the browser, end to end
- [ ] Refreshing the page keeps the session (cookie persists)
- [ ] Visiting a member-only route while logged out redirects to login
- [ ] Profile page shows real data for a real seeded/test member, not hardcoded placeholder numbers

**Commit:** `feat: auth pages and member profile`

---

## Phase 13 — Book detail page

**Goal:** the doc's two-column detail layout with orientation tags and privacy-conscious availability transparency.

**Do:** Two-column layout (cover left; metadata/controls right). Right column: full title, author, language, genre, total vs. available copies, `<StatusBadge>`, highlighted Admin Review box showing `adminReview` text + `orientationTags` as visible tag chips, "ADD TO CART FOR NEXT SESSION" button (adds to a client-side cart — doesn't call the reservation API yet, that's Phase 14's Confirm step) when available. When lent out: show "Currently Lent" / "Lent to: [Name Initial]" / "Expected Return Date: [date]" (from Phase 6's privacy-filtered response) and a "Join Waiting List / Reserve on Return" button instead. Below: related books (same genre, exclude current), member reviews list, Wishlist toggle button (persists to `User.wishlist`).

**Definition of done:**
- [ ] Orientation tags render as their own visible chips, not buried in plain text
- [ ] Lent-out block shows exactly initial + expected return date — confirm in the browser network tab that the API response itself contains no full name/phone/email (this was enforced server-side in Phase 6; re-verify it's actually consumed that way here, not silently re-fetched from an admin endpoint)
- [ ] "Add to Cart for Next Session" adds the book to a visible cart (see Phase 14) without immediately hitting the reservation API
- [ ] Wishlist toggle persists after a page refresh

**Commit:** `feat: book detail page — orientation tags, cart-add, lent-out transparency`

---

## Phase 14 — Reservation Cart (/cart) + My Reservations page

**Goal:** the doc's explicit cart-and-confirm flow, plus the status view.

**Do:**
- `/cart` page: lists books added via Phase 13's "Add to Cart" button (client-side state, e.g. React context or a small store — not yet persisted server-side), shows the per-session limit (2–3 books) with a visible running count, a "Confirm My Reservations | आरक्षण निश्चित करा" button that calls Phase 5's `POST /api/reservations/confirm` with all cart book IDs at once, then clears the local cart on success
- `/my-reservations` page: list of the member's actual confirmed reservations with status, grouped by `sessionDate`, from `GET /api/reservations/mine`

**Definition of done:**
- [ ] Adding a 4th book when the limit is 3 is blocked in the UI before it ever reaches the API, with a clear message
- [ ] Confirming the cart actually creates real reservations visible on `/my-reservations` immediately after
- [ ] If the API rejects the confirm (e.g. a book became unavailable between add-to-cart and confirm), the UI shows the real error, not a generic failure message, and the cart isn't silently cleared
- [ ] Reservations are grouped by the correct upcoming session date

**Commit:** `feat: reservation cart page and my-reservations status page`

---

## Phase 15 — Review submission UI

**Goal:** close the loop the doc calls the "Complete Workflow."

**Do:** Review submission form on the book detail page (star rating + text), reviews list updates visibly after submission without a manual page refresh.

**Definition of done:**
- [ ] Submitting a review updates the book's displayed rating average in the same session
- [ ] Can't submit a review with 0 stars or empty text
- [ ] Attempting a second review on the same book follows whatever rule Phase 7 enforced (upsert or block) — UI reflects it correctly, doesn't just silently fail

**Commit:** `feat: review submission UI`

---

## Phase 16 — Admin dashboard UI

**Goal:** the doc's full Admin section, as UI — inventory, lending log with the fuller fields, session fulfillment desk, and moderation.

**Do:**
- Dashboard stats cards (Phase 8's admin stats)
- Inventory Management: Add/Edit/Delete Books form — title/author/language/genre/cover upload (wired to Phase 17's Cloudinary integration)/shelf number/orientation tags/admin review text/Book-of-the-Week toggle
- Lending Log & Registration form: Name, Phone Number, Email, Address/Society, Date Issued, Expected Return Date, Remarks — calls Phase 6's issue endpoint
- Receive Returns action (calls the return endpoint)
- Approve/Cancel Reservations (Phase 5's admin endpoints)
- **Session Fulfillment Desk**: pick a session date, see the printable/exportable list of approved reservations for that session (Phase 8's endpoint) — include a browser print button, not just an on-screen list
- Manage Members, Manage/Moderate Reviews
- Export Reports button (downloads Phase 8's general `.xlsx`)

**Definition of done:**
- [ ] Every admin action in this list works end to end against the real API — check off each one individually, not as a batch
- [ ] Non-admin users cannot reach this UI (route guard, not just a hidden nav link)
- [ ] Session Fulfillment Desk view, for a real session date with real approved reservations, matches what you'd expect by hand-counting the seed/test data
- [ ] Export button actually downloads a valid file in the browser

**Commit:** `feat: admin dashboard UI — inventory, lending log, session fulfillment desk`

---

## Phase 17 — Cloudinary image upload

**Goal:** real cover image upload/storage, replacing any placeholder image URLs used so far.

**Do:** Backend endpoint that accepts an image upload and forwards to Cloudinary (check the actual installed `cloudinary` SDK version's upload API before writing code), returns the hosted URL, saves it to `Book.coverImageUrl`. Wire the Admin "Add/Edit Book" form to use it.

**Definition of done:**
- [ ] Uploading a real image file from the admin UI results in a real Cloudinary-hosted URL stored on the book
- [ ] The uploaded image actually renders on Home (Book of the Week), Browse, and Detail pages
- [ ] Uploading a non-image file is rejected with a clear error, not a silent failure

**Commit:** `feat: Cloudinary cover image upload`

---

## Phase 18 — Accessibility & design-spec QA pass

**Goal:** verify the style guide's exact numbers against the real, now-fully-built app — not just Phase 9's base setup.

**Do:** Audit every page against the Design Reference's concrete numbers: computed body font-size ≥ 18px, heading sizes 24–36px, button heights ≥ 48px. Re-check Font Scaler/High-Contrast/Language toggle on every page built so far (not just Phase 9's stubs). Re-check at 200% zoom and at mobile width. Run an automated accessibility check (e.g. axe DevTools) on Home, Browse, Book Detail, Cart, Admin Dashboard and fix flagged issues.

**Definition of done:**
- [ ] Inspect computed styles in devtools on at least 3 pages and confirm body text is genuinely ≥18px and primary buttons are genuinely ≥48px tall (don't eyeball it)
- [ ] Font Scaler/High-Contrast/Language toggle all still work correctly on every page, not just the ones built in Phase 9
- [ ] axe (or equivalent) reports no critical violations on the five pages listed above
- [ ] Full keyboard-only navigation reaches all primary actions (tab through a page without a mouse)

**Commit:** `fix: accessibility and design-spec compliance pass`

---

## Phase 19 — Full end-to-end QA pass

**Goal:** verify the whole app against **both** source documents, not just each phase in isolation.

**Do:** Walk through every bullet in `Open_Library_Full_Requirements_Document.docx` (functional scope) and the System Design & UI/UX doc (page-by-page layout, theme, accessibility numbers) as one combined manual checklist. For each, either confirm it works in the running app or log it as a gap.

**Definition of done:**
- [ ] Every item in both source docs is checked off against the actual running app, by you, in a browser — not assumed from the phase list above
- [ ] Any gaps found are logged and fixed before moving to deployment
- [ ] A second person (or a fresh Claude session with no memory of the build) can follow the README and get the app running locally from a clean clone

**Commit:** `test: full requirements QA pass (both docs), fixes`

---

## Phase 20 — Deployment

**Goal:** live URLs, matching the docs' suggested hosting.

**Do:**
- MongoDB Atlas: confirm production cluster + IP allowlist / connection settings
- Render: deploy `server/`, set real env vars (never commit them), confirm `/health` responds on the public URL
- Vercel: deploy `client/`, set the API base URL env var to the Render URL, confirm CORS is configured on the server for the Vercel domain specifically (not `*`)
- Cloudinary: confirm production keys are the ones actually in use, not dev/test keys

**Definition of done:**
- [ ] Public frontend URL loads and can register/login/browse/add-to-cart/confirm-reservation against the public backend URL
- [ ] CORS only allows the actual frontend origin, not a wildcard
- [ ] No secrets appear in any committed file or in client-side bundle (check the built JS for accidentally-inlined keys)

**Commit:** `chore: production deployment config`

---

## Phase 21 — Admin Dashboard UI overhaul (enhancement to Phase 16)

**Context:** Phase 16 shipped a working admin dashboard (commit `a1bee42`) as a single long-scrolling page with inline forms. Everything functions and is wired to the real API, but the UX is rough: one giant scroll, a raw "Book ID" text field for lending, plain lists instead of tables, no confirmations on destructive actions, and no search. This phase improves the **UI only** — no backend/API changes, no new data, no change to what data is managed. All existing endpoints and their contracts stay exactly as-is.

**Goal:** a clean, navigable, admin-only management surface for the store data that already exists, with safer and faster CRUD.

**Do:**
- **In-dashboard section navigation** — replace the single long scroll with a tab/section switcher (Overview · Inventory · Lending · Reservations · Members · Reviews · Reports). Only one section visible at a time; the active section is clearly highlighted (reuse the terracotta active-tab treatment from the top nav).
- **Inventory as a table** — columns: cover thumbnail, title, author, language, genre, available/total, Book-of-Week flag, actions. Row actions: **Edit** (opens a form panel/modal pre-filled with the book), **Delete** (with a confirm step), **Make Book of Week**. Add a client-side **search box** (title/author) to filter the table for large catalogs.
- **Add/Edit book in a modal or dedicated panel** (not an always-open inline grid), with the exact field set from Phase 16 (title, author, language enum, genre enum, coverImageUrl, shelfNumber, orientationTags, adminReview, isBookOfWeek, totalCopies, availableCopies) and validation feedback.
- **Lending form: replace the raw Book ID text input with a searchable book selector** (dropdown/typeahead listing issuable books by title). The admin never types a raw ObjectId. Keep the registration fields exactly (Name, Phone, Email, Address/Society, Date Issued, Expected Return Date, Remarks).
- **Confirmation on all destructive/irreversible actions** — delete book, delete review, cancel reservation, receive return — a simple confirm dialog before the API call.
- **Consistent visual polish** — cards/tables using the existing theme tokens (no new hardcoded hex), empty states, loading states, and success/error toasts or inline messages per action.
- **Preserve accessibility** — section tabs keyboard-reachable, buttons keep the ≥48px min height, everything works under the Font Scaler / High-Contrast toggle already built in Phase 9.

**Do NOT:** add new endpoints, change any API request/response shape, change the seeded admin account, or expand what entities are managed. This is a presentation-layer refactor of `client/src/pages/AdminDashboard.jsx` (may split into `client/src/components/admin/*` sub-components).

**Definition of done:**
- [ ] Admin dashboard shows one section at a time via a working section switcher; non-admins still cannot reach `/admin` (route guard unchanged)
- [ ] Inventory table renders all books with thumbnails; search filters it; Edit/Delete/Make-BOW all work end to end against the real API (verify each in the browser)
- [ ] Deleting a book and deleting a review each require a confirmation step before the request fires
- [ ] Lending uses a book selector (no raw ObjectId typing) and issuing still hits `POST /api/loans/issue` correctly
- [ ] Every previously-working admin action (stats, approve/cancel reservation, receive return, session fulfillment, members list, review moderation, xlsx export) still works after the refactor — checked individually, not assumed
- [ ] No backend files changed; `git diff` for this phase touches only client admin UI files
- [ ] Layout doesn't break at mobile width or under High-Contrast / Font Scaler

**Commit:** `feat: admin dashboard UI overhaul — sectioned nav, inventory table, safer CRUD`

---

## Post-MVP backlog (explicitly deferred — do not build during the phases above)

From the functional doc's "Additional Features Recommended" and "Future Phase Features": New Arrivals, Popular/Most Read Books, Reading Challenges, Volunteer Management, Community Notice Board, Reading Statistics, Monthly Reading Report, Library Events Calendar, barcode issue/return, Event Registration, Volunteer Portal, Newsletter System, Reading Certificates, Recommendation Engine, Member Reading Leaderboard, Donor Recognition Section, Featured Reader/Volunteer of the Month.

From the System Design doc's "Suggested Value-Added Features (Phased Integration)": **WhatsApp Due Date Reminders** (needs a WhatsApp Business API integration + per-message cost — evaluate providers before committing), **Digital Member QR Cards** (needs a QR generation lib + a camera-scanning admin flow), **Community Book Suggestions / donation form** (distinct from the personal Wishlist already in MVP — this is a public "request us to acquire/accept a donated title" form, separate feature).

If you take any of these on later, give each one its own phase using this same template — don't bolt them onto an existing phase.

---

## Quick reference: what "don't hallucinate" means at each layer

| Risk | Guardrail |
|---|---|
| Inventing a library method that doesn't exist in the installed version | Check `node_modules/<pkg>/README.md` or run a quick script against it before relying on it in real code |
| Inventing a field name that drifts from Phase 2's schema | Grep the actual model file; never re-type a field name from memory across phases |
| Approximating a color, copy string, or size instead of using the exact value | Grep the Design Reference section of this file; never eyeball a hex code or paraphrase bilingual copy |
| Claiming a test passed without running it | Guardrail block above requires pasting real command output |
| Silently expanding scope ("while I'm here, I'll also add...") | Definition-of-done gate checks `git status` only shows expected files |
| Losing track of what's actually built vs. planned | This file is the single source of truth for phase scope — re-read the relevant phase at the start of each session instead of relying on conversation memory |
| Exposing private member data (phone/email/address) in a public response | Phase 6 and Phase 13 both explicitly test that the public book-detail response excludes them — don't remove that test later |
