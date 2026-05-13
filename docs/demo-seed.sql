-- Real Estate AI - seed data per demo finale
-- Para ekzekutimit:
-- 1. Krijo dy llogari nga aplikacioni:
--    admin@realestate.test  -> roli admin
--    klient@realestate.test -> roli client
-- 2. Pastaj ekzekuto kete file ne Supabase SQL Editor.

insert into public.profiles (id, full_name, role, phone)
select id, 'Arta Krasniqi', 'admin', '+38344111222'
from auth.users
where email = 'admin@realestate.test'
on conflict (id) do update
set full_name = excluded.full_name,
    role = excluded.role,
    phone = excluded.phone;

insert into public.profiles (id, full_name, role, phone)
select id, 'Dion Berisha', 'client', '+38344222333'
from auth.users
where email = 'klient@realestate.test'
on conflict (id) do update
set full_name = excluded.full_name,
    role = excluded.role,
    phone = excluded.phone;

with demo_admin as (
  select id from auth.users where email = 'admin@realestate.test' limit 1
)
insert into public.properties (
  owner_id,
  title,
  description,
  listing_type,
  property_type,
  city,
  neighborhood,
  price,
  area,
  bedrooms,
  bathrooms,
  status,
  image_url
)
select
  demo_admin.id,
  seed.title,
  seed.description,
  seed.listing_type,
  seed.property_type,
  seed.city,
  seed.neighborhood,
  seed.price,
  seed.area,
  seed.bedrooms,
  seed.bathrooms,
  seed.status,
  seed.image_url
from demo_admin
cross join (
  values
    (
      'Banesë moderne me qira në Bregun e Diellit',
      'Banesë e mobiluar, me ndriçim natyral dhe qasje të shpejtë në qendër. E përshtatshme për studentë ose çift të ri.',
      'rent',
      'Banesë',
      'Prishtinë',
      'Bregu i Diellit',
      480,
      72,
      2,
      1,
      'active',
      null
    ),
    (
      'Shtëpi familjare për shitje në Veternik',
      'Shtëpi me oborr, hapësirë parkimi dhe organizim të mirë për familje. Lagje e qetë me qasje të mirë në rrugë kryesore.',
      'sale',
      'Shtëpi',
      'Prishtinë',
      'Veternik',
      185000,
      168,
      4,
      2,
      'active',
      null
    ),
    (
      'Penthouse me pamje në Arbëri',
      'Penthouse me tarracë të madhe, orientim të mirë dhe standard të lartë ndërtimi. I përshtatshëm për blerës që kërkojnë privatësi.',
      'sale',
      'Penthouse',
      'Prishtinë',
      'Arbëri',
      265000,
      142,
      3,
      2,
      'active',
      null
    ),
    (
      'Zyrë kompakte për qira në qendër',
      'Hapësirë pune e përshtatshme për studio, konsulencë ose ekip të vogël. Afër shërbimeve kryesore të qytetit.',
      'rent',
      'Zyrë',
      'Prishtinë',
      'Qendër',
      650,
      58,
      2,
      1,
      'draft',
      null
    )
) as seed (
  title,
  description,
  listing_type,
  property_type,
  city,
  neighborhood,
  price,
  area,
  bedrooms,
  bathrooms,
  status,
  image_url
)
where not exists (
  select 1
  from public.properties p
  where p.owner_id = demo_admin.id
    and p.title = seed.title
);

with demo_client as (
  select id from auth.users where email = 'klient@realestate.test' limit 1
),
demo_property as (
  select id
  from public.properties
  where title = 'Banesë moderne me qira në Bregun e Diellit'
  limit 1
)
insert into public.favorites (user_id, property_id)
select demo_client.id, demo_property.id
from demo_client, demo_property
on conflict (user_id, property_id) do nothing;

with demo_client as (
  select id from auth.users where email = 'klient@realestate.test' limit 1
),
demo_property as (
  select id
  from public.properties
  where title = 'Banesë moderne me qira në Bregun e Diellit'
  limit 1
)
insert into public.inquiries (
  property_id,
  client_id,
  full_name,
  email,
  phone,
  message,
  status
)
select
  demo_property.id,
  demo_client.id,
  'Dion Berisha',
  'klient@realestate.test',
  '+38344222333',
  'Përshëndetje, dua të caktoj një vizitë këtë javë për këtë banesë.',
  'new'
from demo_client, demo_property
where not exists (
  select 1
  from public.inquiries i
  where i.client_id = demo_client.id
    and i.property_id = demo_property.id
    and i.email = 'klient@realestate.test'
);
