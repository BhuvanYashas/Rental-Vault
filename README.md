# Rental Vault

A rental marketplace for household items. College project.

## The idea

People buy things they don't use often. A drill. A projector. An induction cooktop. Meanwhile, other people need these things for a short time and don't want to buy them.

Rental Vault is a small physical hub (a vault) where owners leave items. Renters pick them up, use them, and return them. Every item gets photographed at intake and return, so both sides have proof of its condition.

## What works

- Sign up with username, age, email, password
- Browse available items
- Rent an item (must take a photo)
- Return an item (must take a photo, only operators can do this)
- View your rental history with before/after photos
- Damage claim system with three levels:
  1. Operator files a claim
  2. Renter can dispute it
  3. If the renter disagrees with the ruling, they ask for re-review
  4. A platform reviewer makes the final decision
- Operator dashboard shows inventory, active rentals, and custody trail

## How the trust part works

Photos + audit trail + escrow = trust.

When someone rents an item, they take a photo. When they return it, the operator takes another. Both photos stay attached to the transaction. If there's damage, the operator can compare them side by side and file a claim.

Every state change is logged with time, person, and photo. That's the custody trail.

Escrow holds the deposit while the item is out. Released when the item comes back.

## Three roles

- Renter: browses, rents, returns
- Operator: vault staff, processes returns, files claims
- Platform: neutral reviewer, decides escalated disputes

## Tech

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase (Postgres + Auth + Storage)
- Vercel (hosting)

## Why Supabase

I didn't build a custom backend. Supabase gives Postgres, auth, and file storage together. Row Level Security (RLS) handles permissions at the database level. The frontend talks to Supabase directly, no API routes needed.

## Setup

Clone the repo and install:

    git clone https://github.com/YOUR-USERNAME/rental-vault
    cd rental-vault
    npm install

Create a `.env.local` file:

    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

Then in the Supabase SQL editor, run the SQL from the `supabase/` folder. It sets up the tables, the trigger that creates user profiles, and all the RLS policies.

Start the dev server:

    npm run dev

## Known limits

Things I skipped because of the deadline:

- No real payments. Escrow is just a number in the database.
- Email confirmation is off (Supabase free tier limit)
- No rate limits on signups
- Photos are in a public bucket (should be signed URLs in production)
- Rentals are fixed at 7 days
- No email or push notifications
- One vault location only

## What's next

- Razorpay or Stripe for real escrow
- Real email via Resend
- Private storage with signed URLs
- Late fees for overdue returns
- Mobile app

## Testing accounts

- Operator: operator2@gmail.com / operator123
- Platform: platform@gmail.com / platform123

(Change these before any real use.)

## Notes

The camera uses the browser's `getUserMedia` API. Users have to take a live photo. They can't upload from the gallery. This makes it harder to fake the item's condition.