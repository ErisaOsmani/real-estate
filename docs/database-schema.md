# Database Schema

Ky është dizajni i planifikuar për versionin marketplace të Real Estate AI. Në Javën 1 përdoret si kontratë produkti; në sprintet e ardhshme tabelat lidhen plotësisht me UI-në.

## `profiles`

Ruan profilin e përdoruesit dhe rolin kryesor.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'client')),
  phone text,
  created_at timestamptz not null default now()
);
```

## `properties`

Ruan pronat që admini/pronari i publikon për shitje ose qira.

```sql
create table properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  listing_type text not null check (listing_type in ('sale', 'rent')),
  property_type text not null,
  city text not null,
  neighborhood text,
  price numeric not null,
  area numeric,
  bedrooms int,
  bathrooms int,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'sold', 'rented')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## `favorites`

Ruan pronat që klienti i shënon si të preferuara.

```sql
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);
```

## `inquiries`

Ruan interesimet ose kërkesat për vizitë nga klientët.

```sql
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  client_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'visit', 'closed')),
  created_at timestamptz not null default now()
);
```

## Rregullat e qasjes

- Admini/pronari mund të krijojë, editojë dhe fshijë vetëm pronat e veta.
- Klienti mund të shohë vetëm pronat me `status = 'active'`.
- Klienti mund të menaxhojë vetëm favoritët e vet.
- Admini mund të shohë interesimet për pronat që i takojnë atij.
- Roli ruhet si `admin` ose `client`.
