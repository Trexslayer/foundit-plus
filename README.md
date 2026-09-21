FoundIt+

FoundIt+ is a lost-and-found web application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

The application allows users to:

- Report items they have found.
- Browse publicly reported lost/found items.
- Claim an item they believe belongs to them.
- Submit ownership proofs.
- Suggest additional verification checks.
- Allow the finder to verify submitted ownership proofs.
- Use private verification questions to establish ownership.
- Track a claim's ownership verification score.
- Manage found items and claims from a dashboard.
- Create an account and authenticate using Supabase Auth.

---

Tech Stack

Technology| Purpose
Next.js| React framework and application routing
TypeScript| Type-safe development
Tailwind CSS| Styling
Supabase| Authentication and PostgreSQL database
Supabase Auth| Signup, login, and session management
"@supabase/ssr"| Supabase integration with Next.js
PostgreSQL| Application database

This project uses the Next.js App Router.

There is no Prisma dependency.

---

Project Structure

The application uses a "src/" directory:

foundit-plus/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── claims/
│   │   │   │   └── route.ts
│   │   │   ├── items/
│   │   │   │   └── route.ts
│   │   │   ├── proofs/
│   │   │   │   └── route.ts
│   │   │   └── verification/
│   │   │       ├── answers/
│   │   │       │   └── route.ts
│   │   │       └── checks/
│   │   │           └── route.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── claim/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── found/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── found/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ClaimForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── ProofCard.tsx
│   │   ├── ProofForm.tsx
│   │   ├── VerificationAnswerForm.tsx
│   │   └── VerificationCheckForm.tsx
│   │
│   ├── lib/
│   │   ├── score.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── server.ts
│   │
│   └── types/
│       └── index.ts
│
├── .env.local
├── package.json
├── tsconfig.json
└── README.md

---

Features

Authentication

FoundIt+ uses Supabase Auth.

Users can:

- Sign up with email and password.
- Log in.
- Log out.
- Access their dashboard after authentication.

Authentication is handled by Supabase rather than a custom users table.

Signup

The signup page is available at:

/register

Users provide:

- Email
- Password
- Password confirmation

Passwords must contain at least six characters.

If Supabase email confirmation is enabled, users must verify their email before logging in.

Login

The login page is:

/login

---

Found Items

Users can report an item they have found.

A found item can contain:

- Title
- Description
- Category
- Location
- Date/time found
- Image
- Private information

The private information is intended to contain identifying information that should not be exposed publicly.

Example:

Title:
Black iPhone 14

Description:
Found near the university library.

Category:
Electronics

Location:
University Library

Private information:
Small scratch underneath the phone case.

The public description should not contain information that makes ownership trivial to prove.

---

Claims

A user can claim a found item.

Each claim contains:

claimant
item
message
score
status
created_at

Possible claim statuses:

PENDING
ACCEPTED
REJECTED

A user cannot create multiple claims for the same item.

The database enforces this with:

unique(item_id, claimant_id)

---

Ownership Verification

The central feature of FoundIt+ is ownership verification.

A claimant should not simply be trusted because they know information already visible in the public item listing.

Instead, the finder can require additional proof.

There are two primary mechanisms.

1. Ownership Proofs

A claimant can submit proof such as:

«I can provide the original purchase receipt.»

or:

«The phone has a small scratch on the bottom-left corner.»

Proofs have a type and status.

Proof Types

OWNER_PROOF
OWNER_SUGGESTION
FINDER_PROOF

Proof Statuses

PENDING
ACCEPTED
REJECTED
CLARIFICATION

The finder reviews submitted proofs.

---

Private Verification Checks

The finder can create a verification question that only the legitimate owner should reasonably know.

For example:

Question:
What is written on the sticker underneath the laptop?

Expected answer:
Property of ABC University

The expected answer remains private to the finder.

The claimant sees only:

What is written on the sticker underneath the laptop?

They do not receive:

Property of ABC University

The claimant submits an answer.

The finder then decides whether the answer is:

ACCEPTED
REJECTED
CLARIFICATION

An accepted verification answer can contribute to the claimant's ownership score.

---

Ownership Score

Each accepted proof contributes weight to the claim.

The current prototype calculates the score using accepted proof weights.

For example:

Proof A: 20 points
Proof B: 25 points
Proof C: 25 points

If all proofs are accepted:

100%

The score calculation is implemented in:

src/lib/score.ts

Current calculation:

export function calculateScore(
  proofs: { status: string; weight: number }[]
): number {
  if (proofs.length === 0) return 0;

  const totalWeight = proofs.reduce(
    (sum, proof) => sum + proof.weight,
    0
  );

  if (totalWeight === 0) return 0;

  const acceptedWeight = proofs
    .filter((proof) => proof.status === "ACCEPTED")
    .reduce((sum, proof) => sum + proof.weight, 0);

  return Math.min(
    100,
    Math.round((acceptedWeight / totalWeight) * 100)
  );
}

The score is currently a prototype mechanism and should not be treated as a cryptographically secure ownership determination.

---

Database

FoundIt+ uses PostgreSQL through Supabase.

The database contains five main application tables:

found_items
claims
proofs
verification_checks
verification_answers

Supabase's built-in:

auth.users

table is used for authentication.

A separate custom "users" table is not required for the current application.

---

Database Schema

"found_items"

Stores reported found objects.

create table found_items (
  id uuid primary key default gen_random_uuid(),
  finder_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  private_info text,
  image_url text,
  category text,
  location text,
  found_at timestamptz,
  status text not null default 'OPEN'
    check (status in ('OPEN', 'CLAIMED', 'RETURNED', 'CLOSED')),
  created_at timestamptz not null default now()
);

---

"claims"

Stores ownership claims.

create table claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references found_items(id) on delete cascade,
  claimant_id uuid not null references auth.users(id) on delete cascade,
  message text,
  score integer not null default 0 check (score >= 0 and score <= 100),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at timestamptz not null default now(),
  unique(item_id, claimant_id)
);

---

"proofs"

Stores ownership and finder-provided proofs.

create table proofs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references found_items(id) on delete cascade,
  claim_id uuid references claims(id) on delete cascade,
  title text not null,
  description text not null,
  type text not null
    check (type in (
      'OWNER_PROOF',
      'OWNER_SUGGESTION',
      'FINDER_PROOF'
    )),
  status text not null default 'PENDING'
    check (status in (
      'PENDING',
      'ACCEPTED',
      'REJECTED',
      'CLARIFICATION'
    )),
  weight integer not null default 10,
  image_url text,
  created_at timestamptz not null default now()
);

---

"verification_checks"

Stores private questions created by the finder.

create table verification_checks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references found_items(id) on delete cascade,
  finder_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  expected_answer text not null,
  created_at timestamptz not null default now()
);

---

"verification_answers"

Stores claimant answers to verification checks.

create table verification_answers (
  id uuid primary key default gen_random_uuid(),
  check_id uuid not null references verification_checks(id) on delete cascade,
  claim_id uuid not null references claims(id) on delete cascade,
  answer text not null,
  status text not null default 'PENDING'
    check (status in (
      'PENDING',
      'ACCEPTED',
      'REJECTED',
      'CLARIFICATION'
    )),
  created_at timestamptz not null default now(),
  unique(check_id, claim_id)
);

---

Row Level Security

Row Level Security (RLS) is enabled on all application tables.

The application uses RLS to restrict operations based on the authenticated Supabase user.

Examples:

- Users can create found items only for themselves.
- Finders can manage their own found items.
- Claimants can manage their own claims.
- Finders can review claims for their items.
- Claimants can submit their own proofs.
- Finders can review proofs for their items.
- Finders can create verification checks.
- Claimants can submit answers to checks.
- Finders can review verification answers.

This provides an additional security layer beyond the UI.

---

Supabase Setup

1. Create a Supabase Project

Create a new project in Supabase.

After creating the project, obtain:

Project URL
Anon/Public Key

These are available from the Supabase project settings.

---

2. Configure Environment Variables

Create:

.env.local

in the project root.

Add:

NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

Do not commit ".env.local" to Git.

---

Supabase Authentication

Open:

Supabase Dashboard
→ Authentication
→ Providers

Enable the Email provider.

For development, you can configure email confirmation according to your testing requirements.

For a production deployment, email confirmation should generally remain enabled.

---

Supabase URL Configuration

Configure the application's URLs under:

Supabase Dashboard
→ Authentication
→ URL Configuration

For local development, add:

http://localhost:3000

When deploying the application, configure the production domain as well.

---

Installation

Requirements

Install:

- Node.js
- npm
- A Supabase project

Then clone the project:

git clone YOUR_REPOSITORY_URL
cd foundit-plus

Install dependencies:

npm install

If starting from a new Next.js project:

npx create-next-app@latest foundit-plus --typescript --tailwind --eslint --app

Then:

cd foundit-plus

Install Supabase:

npm install @supabase/supabase-js @supabase/ssr

---

Database Setup

Open:

Supabase Dashboard
→ SQL Editor

Run the database schema and RLS policies.

The database should contain:

found_items
claims
proofs
verification_checks
verification_answers

and the necessary indexes and RLS policies.

---

Running Locally

Start the development server:

npm run dev

Open:

http://localhost:3000

---

Application Routes

Public Routes

Home

/

Landing page for FoundIt+.

Found Items

/found

Displays publicly available found items.

Found Item

/found/[id]

Displays information about a specific found item.

Login

/login

User authentication.

Register

/register

New account registration.

---

Dashboard Routes

Dashboard

/dashboard

User dashboard.

Found Items

/dashboard/found

Items reported by the current user.

New Found Item

/dashboard/found/new

Create a new found-item report.

Found Item Management

/dashboard/found/[id]

Finder management page.

The finder can inspect:

- Claims
- Proofs
- Verification checks
- Verification answers

Claim

/dashboard/claim/[id]

Claimant management page.

The claimant can:

- View their claim
- Submit ownership proofs
- View available verification questions
- Submit verification answers

---

API Routes

Claims

POST /api/claims

Creates a claim for a found item.

---

Found Items

POST /api/items

Creates a found-item report.

---

Proofs

POST /api/proofs

Creates a proof.

PATCH /api/proofs

Allows the finder to review a proof.

---

Verification Checks

POST /api/verification/checks

Creates a private verification check.

---

Verification Answers

POST /api/verification/answers

Submits an answer to a verification check.

PATCH /api/verification/answers

Allows the finder to review an answer.

---

Supabase Clients

The project intentionally uses two Supabase clients.

Browser Client

Located at:

src/lib/supabase/client.ts

Use this from Client Components.

Example:

"use client";

import { createClient } from "@/lib/supabase/client";

This client is used for operations such as:

supabase.auth.signUp()
supabase.auth.signInWithPassword()
supabase.auth.signOut()

---

Server Client

Located at:

src/lib/supabase/server.ts

This client uses:

import { cookies } from "next/headers";

It must only be used from server-side App Router code.

For example:

import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();

Do not import this client into a component containing:

"use client";

---

Development Guidelines

Client Components

Use Client Components when browser interaction is required.

Examples:

ClaimForm.tsx
ProofForm.tsx
VerificationAnswerForm.tsx
VerificationCheckForm.tsx
Navbar.tsx

These should use:

src/lib/supabase/client.ts

---

Server Components

Use Server Components for server-side database operations where appropriate.

These can use:

src/lib/supabase/server.ts

---

Security Considerations

FoundIt+ handles potentially sensitive ownership information.

The following principles are important.

Never expose private verification answers

The finder creates:

question
expected_answer

The claimant should receive only:

question

The expected answer must remain private.

---

Do not trust client-side scores

The browser should not be considered authoritative for:

claim.score
proof.status
verification_answers.status

These values should ultimately be calculated or validated server-side.

---

Do not expose private item information

"private_info" is intended for information that should not be visible to anonymous users.

The current prototype schema stores public and private item information in the same table. Before production deployment, access to "private_info" should be hardened, ideally by separating private data or exposing public fields through a controlled view/RPC.

---

Known Prototype Limitations

The current application is intended as a working prototype.

Before production deployment, consider addressing:

Authentication session refresh

A Next.js/Supabase middleware or proxy should be added to reliably refresh authentication sessions across server requests.

Email confirmation callback

A production implementation should include a dedicated email-confirmation callback flow using Supabase's recommended SSR authentication pattern.

Private item data

"private_info" should not be exposed through unrestricted public row selection.

Verification check privacy

The public claimant interface must never expose:

verification_checks.expected_answer

A secure RPC/view or separate public/private verification tables can be used.

Proof duplication

Accepted verification answers should eventually be linked directly to generated proofs to prevent duplicate proof creation.

Score manipulation

The current scoring system is intentionally simple. A production system should define strict rules for:

- Maximum proof weights
- Duplicate proofs
- Number of accepted proofs
- Finder-created proofs
- Verification checks
- Score recalculation
- Race conditions

File uploads

The current schema contains:

image_url

but a production implementation should use Supabase Storage or another controlled object-storage system rather than trusting arbitrary URLs.

---

Typical User Flow

Finder

Create account
      ↓
Log in
      ↓
Report found item
      ↓
Add public description
      ↓
Keep identifying information private
      ↓
Receive claims
      ↓
Review claimant
      ↓
Create verification check
      ↓
Review proofs and answers
      ↓
Accept or reject claim
      ↓
Return item

Claimant

Create account
      ↓
Browse found items
      ↓
Open item
      ↓
Submit claim
      ↓
Submit ownership proof
      ↓
Answer private verification questions
      ↓
Finder reviews evidence
      ↓
Claim is accepted or rejected

---

Example Verification Flow

Suppose a finder discovers a laptop.

Public listing:

Black Lenovo laptop
Found near the library.

The finder knows a private detail:

There is a university sticker underneath the laptop.

The finder creates:

Question:
What text is printed on the sticker underneath the laptop?

The claimant sees the question but not the expected answer.

The claimant responds:

Property of ABC University

The finder compares the answer with the private expected answer.

If correct, the finder can accept the verification answer.

The accepted verification can then contribute to the claim's ownership score.

---

Git

A typical Git workflow:

git init
git add .
git commit -m "Initial FoundIt+ implementation"

Create a remote repository and push:

git remote add origin YOUR_REPOSITORY_URL
git branch -M main
git push -u origin main

Do not commit:

.env.local

---

Environment Variables

Required:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

The public Supabase URL and anon key are designed to be used by the application.

Never put the Supabase service-role key in:

NEXT_PUBLIC_*

and never expose a service-role key to the browser.

---

Future Improvements

Potential future features include:

- Supabase Storage image uploads
- Email verification callback
- Password reset
- Google authentication
- Profile names
- User avatars
- Location/map integration
- Item search and filtering
- Categories
- Notifications
- Email notifications
- Claim messaging
- Multiple finders
- Multiple claimants
- QR codes
- Item handover confirmation
- Returned-item tracking
- Report/abuse functionality
- Admin moderation
- Audit logs
- More robust ownership scoring
- Fraud prevention
- Rate limiting

---

License

Add the project's license here.

Example:

MIT License

if the project is intended to be released under MIT.