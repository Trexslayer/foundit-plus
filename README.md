# FoundIt+

FoundIt+ is a lost-and-found web application built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

The application allows users to:

- Report items they have found
- Browse publicly reported found items
- Claim an item they believe belongs to them
- Submit ownership proofs
- Suggest additional verification checks
- Answer private verification questions
- Allow finders to verify ownership claims
- Track a claim's ownership verification score
- Manage found items and claims from a dashboard
- Create accounts and authenticate using Supabase Auth

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework and application routing |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| Supabase | Authentication and PostgreSQL database |
| Supabase Auth | Signup, login, and session management |
| `@supabase/ssr` | Supabase integration with Next.js |
| PostgreSQL | Application database |

This project uses the **Next.js App Router**.

There is **no Prisma** dependency.

---

## Project Structure

```text
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