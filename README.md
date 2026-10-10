# UMERAȘ Second-Hand (nume provizoriu)

Magazin second-hand online, construit ca o experiență 3D: intri pe ușă, te plimbi printre rafturi, iei haine de pe umerașe și plătești la casa de marcat.

## Stadiu

- [x] **Ușa:** stil curat (turcoaz + alb), ușa umple ecranul. Mânerul, afișul legal și stickerul „Sari peste intro” pulsează și au contur, ca să se vadă că se pot apăsa.
- [x] **Magazinul văzut de sus:** machetă cu pini pe fiecare secțiune (tricouri, rochii, blugi, cămăși, pantaloni, geci, standurile Reduceri și Noutăți, casa de marcat). Atingi un pin sau un raft și camera merge acolo.
- [x] **Raftul:** treci de la o haină la alta cu swipe sau cu săgețile; umerașele și etichetele de preț se leagănă.
- [x] **Produs real:** tricoul Pull&Bear construit din poze (față + spate), rotit 360°, fundalul blurat, detalii animate, galerie cu pozele reale și zoom.
- [x] **Coșul (local):** tragi haina în jos, în coș, sau apeși pe coș; haina dispare de pe raft; casa de marcat arată produsele și totalul.
- [x] **Vizitatori live:** câte o siluetă pentru fiecare om de pe site, care merge la raftul la care se uită (în preview-ul de pe claude.ai, prin capabilitatea `room`).
- [x] **Casa de marcat:** bon cu produsele, alegerea livrării (curier / easybox, gratuit peste 250 lei), plată cu cardul (card animat, doar vizual) sau ramburs cu factură proformă pentru datele de livrare, bon tipărit la final.
- [x] **Haine de test** pe toate rafturile (vezi `assets/demo/README.md`), cu întoarcere față–spate în loc de rotire liberă.
- [x] **Haine pe umeraș ca un mockup real:** umerașul e potrivit pe umerii fiecărei haine și stă ascuns în ea (se vede doar cârligul), haina are volum și o curbură ușoară, iar când umerașul se leagănă tivul rămâne lin în urmă, fără cute false. Când pui haina în coș cade doar haina; umerașul gol rămâne pe bară (și pe standurile rotative) și se leagănă.
- [ ] Rezervare în timp real pe server (produsul dispare pentru toți cât e în coș, max. 12 ore) + vizitatori live pe site-ul public
- [ ] Panou pentru adăugarea produselor reale

## Cum adaugi un produs real

1. Poze: față și spate (haina pe umeraș, fundal simplu) + detalii (eticheta, imprimeu, defecte).
2. Fundalul se scoate automat (rembg), iar decupajele se salvează în `assets/products/<id>/front.webp` și `back.webp`.
3. Produsul se trece în `js/products.js` (preț, mărime, detalii, poze).

## Cum rulezi local

Nu are build. Deschide folderul cu un server static, de exemplu:

```
npx serve .
```

și intră pe adresa afișată. Three.js se încarcă de pe CDN.

## Structură

- `index.html`: pagina
- `css/style.css`: stilurile pentru butoane, fișa produsului, coș, afișul legal
- `js/textures.js`: semne, pini, etichete de preț, afișe (desenate pe canvas)
- `js/figures.js`: hainele (din poze sau forme simple), umerașe, etichete, siluetele vizitatorilor
- `js/products.js`: catalogul
- `js/stage.js`: vederea de produs (360°, coș, galerie cu zoom)
- `js/main.js`: ușa, macheta, rafturile, standurile, casa, vizitatorii live, navigarea
- `assets/products/`: pozele produselor
