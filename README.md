# Real Estate AI

Real Estate AI is a Next.js web app that helps real estate agents and small property teams generate polished property descriptions with AI, save them to their account, and manage listing drafts in one place.

## What the app does

- Authenticated users can sign up, log in, and access a private workspace.
- Users can enter property details and generate a professional listing description with AI.
- Generated descriptions can be saved to Supabase and reviewed later in the personal archive.
- The app prevents duplicate saves and shows helpful loading, success, and error states.

## Who it is for

This project is designed for:

- Real estate agents
- Property marketers
- Small agencies that want faster listing creation

## Tech stack

- Next.js 16 with App Router
- React 19
- Tailwind CSS 4
- Supabase Auth and Database
- Groq API for AI text generation

## Live URL

- Production URL: add your verified deployment URL here before the final presentation
- Local verification: project linted successfully on April 26, 2026

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with the required keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Demo-ready flow

The strongest flow for the presentation is:

1. Log in with an existing account.
2. Enter a realistic property prompt.
3. Generate the AI listing description.
4. Save the result to the property archive.
5. Show that the saved draft appears in the dashboard.

For the full presentation script, see [docs/demo-plan.md](docs/demo-plan.md).

## Readiness checklist

- UI refreshed for homepage, login, and signup
- Auth flow connected with Supabase
- AI generation route connected with Groq
- Property saving flow connected with Supabase
- Lint passing locally
- Demo plan prepared

## Author

Erisa Osmani
