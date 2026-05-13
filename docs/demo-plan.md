# Plani i demos

## Përmbledhja e projektit

**Projekti:** Real Estate AI  
**Kujt i shërben:** agjentëve të patundshmërive, marketerëve të pronave dhe agjencive të vogla.  
**Problemi që zgjidh:** shkrimi manual i përshkrimeve të pronave merr kohë dhe shpesh nuk ka cilësi të njëtrajtshme.  
**Zgjidhja:** aplikacioni përdor AI për t'i kthyer të dhënat bazë të pronës në përshkrim profesional në shqip. Përdoruesi mund ta zgjedhë tonin e tekstit, ta kopjojë rezultatin dhe ta ruajë draftin në arkivin e tij privat.

## Qëllimi i demos

Demoja duhet të tregojë një rrjedhë reale pune:

1. Përdoruesi kyçet në sistem.
2. Përdoruesi vendos detajet e pronës ose përdor shembullin demo.
3. Zgjedh tonin e përshkrimit.
4. AI gjeneron tekst profesional në shqip.
5. Përdoruesi kopjon ose eksporton rezultatin si `.txt`.
6. Përdoruesi e ruan draftin në arkiv.
7. Drafti i ruajtur shfaqet në arkiv, mund të kërkohet, të përdoret përsëri dhe të fshihet me konfirmim.

## Plani i prezantimit

### 0:00 - 0:45 | Hyrja

- Prezantoj projektin si ndihmës AI për krijimin e përshkrimeve të pronave.
- Shpjegoj se projekti është i dobishëm për agjentë dhe agjenci të vogla.
- Theksoj problemin: përshkrimet profesionale kërkojnë kohë, sidomos kur duhet të shkruhen për shumë prona.

### 0:45 - 3:30 | Rrjedha kryesore live

- Hap faqen e kyçjes.
- Kyçem me llogarinë demo.
- Tregoj panelin kryesor dhe statistikat e shkurtra.
- Klikoj `Përdor shembullin demo`.
- Zgjedh tonin, për shembull `Luksoz` ose `Profesional`.
- Klikoj `Gjenero përshkrimin`.
- Lexoj disa fjali nga rezultati.
- Klikoj `Kopjo tekstin` për të treguar përdorim praktik.
- Klikoj `Eksporto .txt` për të treguar se përshkrimi mund të shkarkohet.
- Klikoj `Ruaj pronën`.
- Shfaq arkivin dhe përdor kërkimin për ta gjetur draftin e ruajtur.
- Klikoj `Përdor` për ta kthyer draftin në editor.
- Klikoj `Fshij` dhe tregoj konfirmimin para fshirjes.
- Klikoj `Pastro` për të nisur një përshkrim të ri.

### 3:30 - 5:00 | Shpjegimi teknik

- Frontend-i është ndërtuar me Next.js App Router dhe React.
- Autentikimi dhe ruajtja e pronave bëhen me Supabase.
- API route `/api/chat` validon input-in dhe e dërgon kërkesën te Groq.
- Prompt-i i sistemit kërkon përgjigje në shqip standard dhe pa shpikje faktesh.
- UI përfshin loading states, error handling, mbrojtje nga ruajtjet e dyfishta, kopjim të tekstit, eksportim `.txt`, pastrim të formularit, kërkim në arkiv, ripërdorim të draftit dhe fshirje me konfirmim.

### 5:00 - 6:00 | Vlera e projektit

- Projekti e shpejton përgatitjen e listimeve.
- Teksti i gjeneruar është më profesional sesa një përshkrim i shkruar shpejt.
- Arkivi e bën aplikacionin më të dobishëm, sepse përdoruesi nuk e humb punën e gjeneruar.
- Zgjedhja e tonit e bën produktin më fleksibil për prona të ndryshme.

### 6:00 - 7:00 | Pyetje

- Jam gati të shpjegoj pse janë zgjedhur Next.js, Supabase dhe Groq.
- Jam gati të tregoj si ruhet një pronë dhe si lidhet frontend-i me backend-in.

## Shembulli i rekomanduar për demo

```text
Penthouse modern në Prishtinë, 214 m2, 3 dhoma gjumi, 2 banjo, dritare panoramike, terasë private, kuzhinë premium, parking për 2 vetura, afër qendrës, çmimi 420,000 EUR.
```

Ky shembull është i përshtatshëm sepse:

- Përmban lokacionin, sipërfaqen, çmimin dhe veçoritë kryesore.
- Tregon qartë vlerën e AI-së.
- Jep rezultat të mirë për ton profesional ose luksoz.
- E mban prezantimin të shpejtë dhe të sigurt.

## Çfarë është avancuar në projekt

- Ndërfaqja kryesore është kthyer në shqip.
- Është shtuar zgjedhja e tonit të përshkrimit.
- Është shtuar shembulli demo me një klikim.
- Është shtuar kontrolli i input-it para gjenerimit.
- Është shtuar kopjimi i tekstit të gjeneruar.
- Është shtuar eksportimi i përshkrimit si `.txt`.
- Është shtuar kërkimi në arkivin e pronave.
- Është shtuar fshirja e pronave nga arkivi.
- Është shtuar konfirmimi para fshirjes.
- Është shtuar butoni `Pastro`.
- Është shtuar butoni `Përdor` për ta kthyer një draft nga arkivi në editor.
- API tani kthen mesazhe gabimi më të qarta.
- Prompt-i i AI-së kërkon shqip standard dhe tekst pa gabime drejtshkrimore.

## Kontrolli para prezantimit

- Aplikacioni hapet pa gabime.
- Environment variables janë në `.env.local`.
- Login funksionon me llogarinë demo.
- Gjenerimi me AI funksionon me shembullin e përgatitur.
- Ruajtja e pronës funksionon.
- Arkivi shfaq pronat e ruajtura.
- Kërkimi në arkiv funksionon.
- Eksportimi `.txt` funksionon.
- Fshirja e pronës nga arkivi funksionon.
- Konfirmimi para fshirjes shfaqet.
- Butoni `Pastro` funksionon.
- Butoni `Përdor` në arkiv funksionon.
- README është përditësuar.
- Live URL është testuar para prezantimit.

## Plani B nëse demoja live dështon

1. Hap aplikacionin lokalisht me environment variables të gatshme.
2. Përdor të njëjtën llogari demo dhe të njëjtin shembull.
3. Nëse dështon gjenerimi me AI, shpjegoj rrjedhën dhe tregoj arkivin.
4. Mbaj disa screenshots ose një screen recording të shkurtër si rezervë.

## Checklist për dorëzim

- `docs/demo-plan.md` është i rregulluar në shqip.
- `README.md` është përditësuar.
- Ndërfaqja është më e avancuar dhe më e përshtatshme për prezantim.
- Projekti duhet të testohet lokalisht para dorëzimit final.
