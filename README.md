# UMERAȘ Second-Hand (nume provizoriu)

Magazin second-hand online, construit ca o experiență 3D: intri pe ușă, te plimbi printre rafturi, iei haine de pe umerașe și plătești la casa de marcat.

## Stadiu

- [x] **Pasul 1: ușa magazinului.** Geam prin care se văd oamenii din magazin, semn OPEN care se leagănă și se întoarce, program NON-STOP, mâner cu indicator, sticker „Sari peste intro”, afiș cu informațiile legale, animația de deschidere a ușii.
- [x] **Stil Pixar realist:** cărămidă, lemn vopsit, alamă, lumină filmică cu umbre moi; ușa e singura luminată.
- [x] **Pasul 2: culoarul.** Rafturi cu bannere (tricouri, rochii, blugi, cămăși, pantaloni, geci), standuri Reduceri și Noutăți, casa de marcat cu casier. Mergi trăgând în sus, te uiți trăgând stânga–dreapta, atingi un raft ca să-l vezi de aproape; scurtături jos pe ecran.
- [ ] Pasul 3: umerașe cu swipe, haina în focus, eticheta de preț
- [ ] Pasul 4: coșul (tragi haina în coș)
- [ ] Pasul 5: casa de marcat, plată card (vizual) / ramburs cu factură
- [ ] Pasul 6: rezervare în timp real (produsul dispare din raft când e în coș, max. 12 ore)

## Cum rulezi local

Nu are build. Deschide folderul cu un server static, de exemplu:

```
npx serve .
```

și intră pe adresa afișată. Three.js se încarcă de pe CDN.

## Structură

- `index.html`: pagina
- `css/style.css`: stiluri pentru elementele HTML (indicator, afiș legal, card)
- `js/textures.js`: semnele, stickerele și afișele desenate pe canvas
- `js/people.js`: clienții animați (proporții reale) și hainele cu volum pe umerașe
- `js/main.js`: ușa, culoarul, rafturile, standurile, casa, navigarea și interacțiunile
