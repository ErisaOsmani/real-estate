# Real Estate AI

Real Estate AI është aplikacion web me Next.js që ndihmon agjentët e patundshmërive të gjenerojnë përshkrime profesionale të pronave në shqip, t'i ruajnë draftet dhe t'i menaxhojnë në një arkiv privat.

## Çfarë bën aplikacioni

- Përdoruesit mund të regjistrohen, të kyçen dhe të kenë hapësirë private pune.
- Përdoruesi shkruan detajet e pronës ose përdor shembullin demo.
- Mund të zgjidhet toni i përshkrimit: profesional, luksoz, familjar ose i shkurtër.
- AI gjeneron përshkrim të pastër në shqip.
- Rezultati mund të kopjohet dhe të ruhet në Supabase.
- Rezultati mund të eksportohet si file `.txt`.
- Formulari mund të pastrohet shpejt për të nisur një përshkrim të ri.
- Arkivi shfaq pronat e ruajtura, lejon kërkim të shpejtë, ripërdorim dhe fshirje të draftit.
- Aplikacioni kontrollon input-in, shfaq gjendje loading, sukses dhe gabime të qarta.

## Kujt i shërben

Ky projekt është i përshtatshëm për:

- Agjentë të patundshmërive.
- Marketerë të pronave.
- Agjenci të vogla që duan përshkrime më të shpejta dhe më profesionale.

## Teknologjitë

- Next.js 16 me App Router
- React 19
- Tailwind CSS 4
- Supabase Auth dhe Database
- Groq API për gjenerim të tekstit me AI

## Konfigurimi lokal

1. Instalo varësitë:

```bash
npm install
```

2. Krijo `.env.local` me çelësat e nevojshëm:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

3. Starto serverin lokal:

```bash
npm run dev
```

4. Hape aplikacionin në:

```text
http://localhost:3000
```

## Rrjedha e demos

1. Kyçu me llogarinë demo.
2. Kliko `Përdor shembullin demo`.
3. Zgjidh tonin e përshkrimit.
4. Kliko `Gjenero përshkrimin`.
5. Kopjo tekstin ose eksportoje si `.txt`.
6. Ruaje pronën në arkiv.
7. Shfaq pronën në arkiv, përdor kërkimin, ktheje draftin në editor ose fshije me konfirmim.

Plani i plotë i prezantimit është te [docs/demo-plan.md](docs/demo-plan.md).

## Statusi i projektit

- UI është përditësuar dhe është në shqip.
- API route ka validim më të mirë.
- Gjenerimi me AI është lidhur me Groq.
- Autentikimi dhe ruajtja e pronave janë lidhur me Supabase.
- Arkivi ka kërkim dhe fshirje të pronave.
- Përshkrimi i gjeneruar mund të eksportohet si `.txt`.
- Draftet e arkivit mund të përdoren përsëri në editor.
- Fshirja kërkon konfirmim para se të kryhet.
- Projekti është gati për testim lokal dhe prezantim.

## Autorja

Erisa Osmani
