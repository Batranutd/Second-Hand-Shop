# UMERAȘ Second-Hand (nume provizoriu)

Magazin second-hand online, construit ca o experiență 3D: intri pe ușă, te plimbi printre rafturi, iei haine de pe umerașe și plătești la casa de marcat.

## Stadiu

- [x] **Pasul 1: ușa magazinului.** Geam prin care se văd oamenii din magazin, semn OPEN care se leagănă și se întoarce, program NON-STOP, mâner cu indicator, sticker „Sari peste intro”, afiș cu informațiile legale, animația de deschidere a ușii.
- [ ] Pasul 2: culoarul cu rafturi, bannere și standuri
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
- `js/people.js`: clienții animați și hainele pe umerașe
- `js/main.js`: scena 3D, ușa, animațiile și interacțiunile
