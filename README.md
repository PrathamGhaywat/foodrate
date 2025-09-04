FoodRate
========

Cartoon-style food review app built with Next.js App Router, Tailwind, and shadcn/ui, using Appwrite Database on the client (anonymous sessions).

Setup
-----

1. In Appwrite, enable CORS for your local dev URL and production domain, and allow anonymous sessions.
2. Ensure Database and Collections exist (IDs match names as per your setup):
   - Database: `foodrate`
   - Collections:
     - `food` with attributes: `name` (string, max 30), `imageUrl` (url), `description` (string, max 200)
     - `review` with attributes: `foodId` (string), `username` (string), `review` (string, max 500), `rating` (integer 0–5)
   - Recommended indexes: `food.name` fulltext for search; `review.foodId` for filtering.
3. Create `.env.local` with:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=YOUR_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_APPWRITE_DATABASE_ID=foodrate
NEXT_PUBLIC_APPWRITE_FOOD_COLLECTION_ID=food
NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID=review
```

Run
---

```
npm run dev
```

Pages
-----

- `/` — search landing
- `/create` — create a food
- `/food/[id]` — food detail, list/add reviews

Notes
-----

- This uses the browser SDK with anonymous sessions, so collection permissions must allow reads (role:all) and creation for anonymous users where applicable. Consider moderation & rate limits.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
