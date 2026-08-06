# Toekomstige offerteaanvraag

Deze functionaliteit is bewust nog NIET zichtbaar of actief in de editor.

Later kan Guus de huidige configuratie, mockup en originele uploads versturen naar:

`POST /api/quote-request`

Aanbevolen multipart-velden:

- `request`: JSON met klant- en productgegevens
- `mockup`: gegenereerde PNG
- `logo`: origineel herhaald logo
- `front`: origineel ontwerp voorste lint
- `back`: origineel ontwerp teruglopende lint
- `continuous`: origineel doorlopend ontwerp

De klanteditor blijft voorlopig alleen een mockupgenerator met PNG-download.
