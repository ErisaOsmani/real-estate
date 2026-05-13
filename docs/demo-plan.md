# Plani i Demos

## Produkti

**Real Estate AI** është një marketplace për shpallje të pasurive të paluajtshme me dy role:

- **Admin/Owner:** krijon, menaxhon, publikon dhe promovon pronat.
- **Klient/Banor:** kërkon listime aktive, filtron rezultatet, ruan të preferuarat, kërkon ndihmë nga AI dhe dërgon kërkesa për vizitë.

AI është i përshtatur sipas rolit:

- AI për admin gjeneron përmbajtje për listim dhe marketing.
- AI për klient rekomandon dhe krahason pronat aktive.

## Përgatitja e Demos

1. Krijo një llogari admin nga `/signup`:

```text
admin@realestate.test
```

2. Krijo një llogari klienti nga `/signup`:

```text
klient@realestate.test
```

3. Ekzekuto seed-in e demos në Supabase SQL Editor:

```text
docs/demo-seed.sql
```

4. Konfirmo që `.env.local` përmban:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
NEXT_PUBLIC_ADMIN_EMAILS=admin@realestate.test
```

## Rrjedha Finale e Demos

1. Hap `/login`.
2. Identifikohu si admin.
3. Shfaq `/admin`:
   - numri total i pronave
   - pronat aktive
   - për shitje
   - për qira
   - draftet
   - kërkesat
4. Hap `/admin/properties`.
5. Krijo ose edito një pronë:
   - titulli
   - shitje/qira
   - lloji i pronës
   - qyteti
   - lagjja
   - çmimi
   - sipërfaqja
   - dhomat e gjumit
   - banjot
   - përshkrimi
   - fotografia
   - statusi
6. Kliko `Improve with AI`.
7. Shfaq gjenerimin e mëposhtëm:
   - titull profesional
   - përshkrim
   - postim për Instagram/Facebook
   - version i shkurtër për portal
   - kontrolli i fushave që mungojnë
8. Apliko titullin dhe përshkrimin e gjeneruar nga AI në formë.
9. Ruaje dhe publiko pronën si `Active`.
10. Dil nga llogaria dhe identifikohu si klient.
11. Hap `/properties`.
12. Përdor kërkimin dhe filtrat:
   - shitje/qira
   - qyteti
   - lloji i pronës
   - çmimi min/max
   - dhomat e gjumit
   - sipërfaqja minimale
   - renditja
13. Kliko `Search`.
14. Pyet AI e klientit:

```text
Kam nevojë për një apartament me qira në Prishtinë deri në 500 EUR
```

15. Shfaq rekomandimet, krahasimin, anët pozitive/negative dhe hapin e radhës.
16. Ruaj një pronë si të preferuar.
17. Hap `/favorites`.
18. Hap faqen e detajeve të pronës.
19. Dërgo një kërkesë për vizitë.
20. Identifikohu sërish si admin.
21. Hap `/admin#interesimet`.
22. Përditëso statusin e kërkesës:
   - E re
   - I kontaktuar
   - Vizita e planifikuar
   - Mbyllur

## Screenshots Për t'u Përgatitur

- Faqja e login-it
- Faqja e signup-it me zgjedhje roli
- Dashboard-i i adminit
- Forma e menaxhimit të pronës
- Paketa e marketingut me AI
- Rrjeta e pronave për klientin
- Rekomandimet e AI për klientin
- Faqja e të preferuarave
- Detajet e pronës dhe forma e kontaktit
- Seksioni i kërkesave të adminit

## Verifikimi

Para prezantimit, ekzekuto:

```bash
npm.cmd run lint
npm.cmd run build
```

Rezultati i pritur:

- lint kalon
- build-i i production kalon
- të gjitha rrugët e demos ngarkohen saktë
