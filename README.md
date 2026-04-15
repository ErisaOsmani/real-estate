# Real Estate AI Application

This app lets users sign up, log in, generate AI-powered real estate descriptions, and save their own listings in Supabase.

## Live URL

https://real-estate-kappa-orcin.vercel.app

## Project Description

This project is a full-stack web application that allows users to generate professional real estate property descriptions using AI. The application also includes user authentication and database integration, enabling users to save and manage their own properties securely.

## Features

* AI-powered property description generator
* User authentication (Sign Up / Login)
* Protected routes (only logged-in users can access the dashboard)
* Save generated properties to database
* View only personal data (user-specific properties)
* Logout functionality
* Persistent session (user stays logged in after refresh)

## Technologies Used

* Next.js (React Framework)
* Supabase (Authentication & Database)
* Groq API (AI text generation)
* Tailwind CSS (Styling)

## Local Development

1. Create a `.env.local` file at the project root.
2. Required environment variables (example):

  - `GROQ_API_KEY` - your Groq API key for the AI description endpoint

  - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon/public key

3. Install dependencies and run locally:

```bash
npm install
npm run dev
```

Notes:
- The app uses Supabase for auth and persistence. Ensure your `NEXT_PUBLIC_SUPABASE_*` values are set.
- If you deploy to Vercel, set the same variables in the project settings.

## How It Works

1. User creates an account or logs in
2. User enters property details
3. AI generates a professional description
4. User can save the property
5. Saved properties are stored in Supabase and linked to the logged-in user

## Database & Security

* A table called `properties` is created in Supabase
* Each record includes:

  * id
  * user_id
  * title
  * description
* Row Level Security (RLS) is enabled
* Policies ensure that:

  * Users can only see their own data
  * Users can only insert their own records

## Author

Erisa Osmani
