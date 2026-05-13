# Real Estate AI

Real Estate AI is a real estate marketplace with two clear roles:

- **Admin/Owner:** registers, manages, publishes, and promotes properties.
- **Client/Resident:** browses active properties, filters listings, saves favorites, asks AI for recommendations, and sends visit requests.

## Main Features

- Role-based signup and login.
- Admin dashboard with property statistics and inquiry management.
- Property creation, editing, publishing, unpublishing, and deletion.
- Photo URL/upload support for property listings.
- AI marketing package for admins:
  - professional title
  - listing description
  - social media post
  - short portal version
  - missing-fields check
- Client property search with filters and sorting.
- Favorites saved in Supabase.
- Client AI recommendations and property comparison.
- Contact/visit request form.
- Inquiry status workflow for admins.

## Routes

```text
/login
/signup
/admin
/admin/properties
/properties
/properties/[id]
/favorites
```

## Database Tables

- `profiles`
- `properties`
- `favorites`
- `inquiries`

The schema is documented in [docs/database-schema.md](docs/database-schema.md).

## Tech Stack

- Next.js 16 with App Router
- React 19
- Tailwind CSS 4
- Supabase Auth and Database
- Groq API for AI features

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_ADMIN_EMAILS=admin@realestate.test
```

3. Start the dev server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Demo Accounts

Create these accounts from `/signup`:

```text
Admin: admin@realestate.test
Client: klient@realestate.test
```

Then run the seed file in Supabase SQL Editor:

```text
docs/demo-seed.sql
```

## Final Demo Flow

1. Sign in as the admin and open `/admin`.
2. Open `/admin/properties`, create or edit a property, and use `Improve with AI`.
3. Publish the property as `Active`.
4. Sign in as the client and open `/properties`.
5. Search, filter, ask AI, and save a property as a favorite.
6. Open property details and send a visit request.
7. Return as the admin to `/admin#interesimet` and update the inquiry status.

## Author

Erisa Osmani
