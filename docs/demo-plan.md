# Plani i demos

## Tema e re e projektit

**Real Estate AI** është marketplace për prona me dy role:

- **Admin/Pronar:** regjistron pronat e veta dhe i shpall për shitje ose qira.
- **Klient/Banor:** kërkon banesë ose shtëpi, filtron pronat dhe ruan ato që i interesojnë.

AI nuk do të jetë i njëjtë për të dy rolet:

- Për adminin, AI ndihmon me tituj, përshkrime dhe materiale marketingu.
- Për klientin, AI ndihmon me kërkim natyral, krahasim pronash dhe rekomandime.

## Java 1: Planifikimi, Rolet Dhe Struktura

### Qëllimi

Të përcaktohet qartë produkti dhe të krijohet struktura bazë e aplikacionit.

### Çfarë u vendos

- Rolet:
  - `admin` = Admin/Pronar
  - `client` = Klient/Banor
- Faqet kryesore:
  - `/login`
  - `/signup`
  - `/admin`
  - `/admin/properties`
  - `/properties`
  - `/properties/[id]`
  - `/favorites`
- Database schema e planifikuar:
  - `profiles`
  - `properties`
  - `favorites`
  - `inquiries`
- Flow pas login:
  - admini shkon te `/admin`
  - klienti shkon te `/properties`

### Çfarë u implementua

- Signup me zgjedhje roli: `Admin/Pronar` ose `Klient/Banor`.
- Ruajtje e rolit në metadata të Supabase gjatë regjistrimit.
- Login me redirect sipas rolit.
- Root route `/` e çon përdoruesin te dashboard-i përkatës.
- Faqja `/properties` ka UI fillestar për klientin me kërkim dhe filtër `Shitje/Qira`.
- Faqja `/properties/[id]` është placeholder për detajet e pronës.
- Faqja `/favorites` është placeholder për pronat e ruajtura.
- Faqja `/admin/properties` është placeholder për menaxhimin e pronave nga admini.
- Faqja `/admin` mbetet paneli i adminit dhe lidhet me `/admin/properties`.
- Schema është dokumentuar te `docs/database-schema.md`.

## Rrjedha e demos për Javën 1

1. Hape `/signup`.
2. Zgjidh rolin `Admin/Pronar`.
3. Regjistrohu me email demo, për shembull `admin@realestate.test`.
4. Kyçu nga `/login`.
5. Trego që admini shkon te `/admin`.
6. Hape `/admin/properties` dhe shpjego që këtu admini do të regjistrojë pronat.
7. Dil nga llogaria.
8. Regjistrohu ose kyçu si `Klient/Banor`.
9. Trego që klienti shkon te `/properties`.
10. Filtro pronat sipas `Shitje` dhe `Qira`.
11. Hap një detaj prone te `/properties/[id]`.
12. Hape `/favorites` si strukturë për sprintin e favoritëve.

## Database Schema

Schema e detajuar është te:

```text
docs/database-schema.md
```

Tabelat e planifikuara:

- `profiles`: profili dhe roli i përdoruesit.
- `properties`: pronat që admini publikon.
- `favorites`: pronat që klienti ruan.
- `inquiries`: interesimet ose kërkesat për vizitë.

## Rezultati i Javës 1

Produkti tani ka drejtim të qartë:

- Admini është pronari/agjencia.
- Klienti është banori që kërkon pronë.
- Rrugët kryesore janë krijuar.
- Auth fillon të dallojë rolet.
- UI fillestar i adminit dhe klientit ekziston.
- Dokumentimi për strukturën dhe databazën është gati.

## Java 2: Regjistrimi, Kyçja Dhe Rolet

### Qëllimi

Sistemi të dijë qartë kush është admin/pronar dhe kush është klient/banor.

### Çfarë u implementua

- Signup ka dy zgjedhje roli:
  - `Jam pronar/agjenci`
  - `Po kërkoj banesë`
- Roli ruhet në Supabase metadata.
- Pas signup krijohet profil në tabelën `profiles`.
- Login lexon rolin nga `profiles` dhe bën redirect sipas rolit.
- Nëse tabela `profiles` nuk është ende aktive, sistemi përdor metadata si fallback.
- `/admin` dhe `/admin/properties` janë të mbrojtura për admin.
- `/properties`, `/properties/[id]` dhe `/favorites` janë të mbrojtura për klient.
- U shtua logout në UI-në e klientit.
- Mesazhet kryesore të gabimit janë më të qarta në shqip.

### Rrjedha e demos për Javën 2

1. Hap `/signup`.
2. Zgjidh `Jam pronar/agjenci`.
3. Regjistro adminin dhe trego që krijohet profili.
4. Kyçu nga `/login`.
5. Trego që admini shkon automatikisht te `/admin`.
6. Provo të hapësh `/properties` si admin dhe trego që kthehet te `/admin`.
7. Çkyçu.
8. Regjistro ose kyçu si klient me `Po kërkoj banesë`.
9. Trego që klienti shkon te `/properties`.
10. Provo të hapësh `/admin` si klient dhe trego që nuk lejohet.

## Sprintet e ardhshme

- Java 3: dashboard i adminit me navigim dhe statistika reale.
- Java 4: shtim, editim, fshirje dhe publikim i pronave.
- Java 5: AI për adminin.
- Java 6: UI i klientit me prona reale nga Supabase.
- Java 7: filtra, sortim dhe favorite reale.
- Java 8: AI për klientin.
- Java 9: kontakt dhe interesime.
- Java 10: polish, testim dhe demo finale.
