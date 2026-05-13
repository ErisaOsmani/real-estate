# Real Estate AI

Real Estate AI është marketplace për prona me dy role të qarta: **Admin/Pronar** dhe **Klient/Banor**. Admini regjistron dhe shpall pronat e veta për shitje ose qira; klienti i shfleton, i filtron dhe në sprintet e ardhshme do të marrë ndihmë nga AI për të zgjedhur pronën më të përshtatshme.

## Java 1: Struktura e produktit

Në këtë sprint u vendos baza e produktit:

- Rolet kryesore: `admin` dhe `client`.
- Regjistrimi ka zgjedhje roli: `Admin/Pronar` ose `Klient/Banor`.
- Login bën redirect sipas rolit:
  - admini shkon te `/admin`
  - klienti shkon te `/properties`
- Root route `/` e dërgon përdoruesin te dashboard-i i duhur.
- U hapën faqet kryesore të strukturës:
  - `/login`
  - `/signup`
  - `/admin`
  - `/admin/properties`
  - `/properties`
  - `/properties/[id]`
  - `/favorites`
- U dokumentua schema e planifikuar në [docs/database-schema.md](docs/database-schema.md).

## Java 2: Regjistrimi, Kyçja Dhe Rolet

Në këtë sprint u forcua sistemi i auth-it:

- Signup ka zgjedhje të qartë roli:
  - `Jam pronar/agjenci`
  - `Po kërkoj banesë`
- Roli ruhet në metadata të Supabase dhe në tabelën `profiles`.
- Pas regjistrimit krijohet profili i përdoruesit.
- Login lexon rolin nga `profiles` dhe pastaj bën redirect:
  - admini te `/admin`
  - klienti te `/properties`
- `/admin` dhe `/admin/properties` janë vetëm për admin.
- `/properties`, `/properties/[id]` dhe `/favorites` janë hapësira e klientit.
- Logout është i dukshëm në UI-në e klientit dhe adminit.
- Mesazhet kryesore të gabimit janë në shqip.

## Rolet

**Admin/Pronar**

- Regjistron prona për shitje ose qira.
- Menaxhon pronat e veta.
- Publikon ose çpublikon shpallje.
- Në sprintet e ardhshme përdor AI për tituj, përshkrime dhe materiale marketingu.

**Klient/Banor**

- Shfleton pronat aktive.
- Filtron pronat sipas shitje/qira.
- Hap detajet e pronës.
- Ruan favorite.
- Në sprintet e ardhshme përdor AI për kërkim natyral, krahasime dhe rekomandime.

## Database Schema

Tabelat e planifikuara:

- `profiles`
- `properties`
- `favorites`
- `inquiries`

Detajet janë te [docs/database-schema.md](docs/database-schema.md).

Për Javën 2, tabela `profiles` duhet të krijohet në Supabase që regjistrimi të ruajë rolin si duhet.

## Teknologjitë

- Next.js 16 me App Router
- React 19
- Tailwind CSS 4
- Supabase Auth dhe Database
- Groq API për veçoritë AI

## Konfigurimi lokal

1. Instalo varësitë:

```bash
npm install
```

2. Krijo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_ADMIN_EMAILS=admin@realestate.test
```

3. Starto serverin lokal:

```bash
npm run dev
```

4. Hape aplikacionin:

```text
http://localhost:3000
```

## Demo Accounts

Për demo, admin mund të përdorë email që fillon me `admin@`, ose rol `admin` nga forma e regjistrimit.

```text
Admin: admin@realestate.test
Klient: klient@realestate.test
```

## Autorja

Erisa Osmani
