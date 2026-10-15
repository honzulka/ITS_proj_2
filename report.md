# ITS Projekt 2 - Report

- **Autor:** Jan Černoch (xcernoj00)
- **Datum:** 2026-05-02
- **Kontext:** GUI automatizace (Cypress) pro scénáře navržené v Projektu 1 nad aplikací CHAMP.

## Stručný popis úprav testů oproti Projektu 1

Scénáře z Projektu 1 byly převedeny do Cypress testů bez přímé vazby na `.feature` parser. Oproti původním BDD popisům jsou testy implementované jako kombinace API přípravy dat a GUI ověření ve webovém rozhraní. Tato úprava drží testy samostatné, opakovatelné a méně závislé na pořadí běhu. Testy jsou rozdělené do samostatných souborů podle oblastí: `membership.cy.js`, `users.cy.js`, `payment.cy.js`.

## Mapování BDD scénářů na Cypress testy

| Scenario file | Line (Given) | Cypress file | Line (test start) |
| --- | ---: | --- | ---: |
| `membership.feature` | 9 | `membership.cy.js` | 36 |
| `membership.feature` | 17 | `membership.cy.js` | 47 |
| `membership.feature` | 40 | `membership.cy.js` | 69 |
| `membership.feature` | 56 | `membership.cy.js` | 90 |
| `membership.feature` | 62 | `membership.cy.js` | 118 |
| `users.feature` | 9 | `users.cy.js` | 40 |
| `users.feature` | 21 | `users.cy.js` | 50 |
| `users.feature` | 31 | `users.cy.js` | 74 |
| `users.feature` | 40 | `users.cy.js` | 94 |
| `payment.feature` | 9 | `payment.cy.js` | 15 |
