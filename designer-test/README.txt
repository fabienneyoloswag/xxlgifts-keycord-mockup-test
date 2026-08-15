XXLGifts Designer Test v1
=========================
Upload deze map/repo naar GitHub/Vercel zoals de huidige test.

Bestaande root-editor:
- blijft ongewijzigd vanuit v13.

Nieuwe test:
- /designer-test/

Doel v1:
- grote mockupzone
- live productielijn
- meerdere logo's
- patroonvolgorde A/B/etc.
- aantal + gelijke verdeling
- marge, verticale positie, groepsrotatie
- tekst en opmerkingen
- variantlogica Normaal / Safety / Buckle / Buckle+Safety
- complete artwork upload
- Adobe renderpunt voorbereid

Nog bewust NIET definitief:
- exacte Illustrator artboardmaten (valideren na Adobe login)
- echte Smart Object-render
- productie-export met alle geüploade logo-assets ingebed
- individuele object-editor/snaplijnen (volgende iteratie)

V2 huisstijl:
- Montserrat via Google Fonts
- exact XXLGifts-logo, pagina/artboard 1 van aangeleverde Illustrator
- XXLGifts header + Powered by XXLGifts
- inputs/buttons/cards verfijnd
- bestaande designer-test functionaliteit behouden

V3 SVG analyzer:
- leest SVG client-side in de browser
- splitst conservatief alleen op bestaande top-level vectorgroepen/paden
- toont Compleet logo altijd als veilige fallback
- toont gevonden brononderdelen als A/B/C...
- beweert niet automatisch dat A 'beeldmerk' en B 'woordmerk' is
- interne geometrie van elk onderdeel blijft intact

V4 feedbackronde:
- productielijn standaard fit-to-width, geen horizontale scroll
- lintkleur: color picker + gekoppeld HEX veld
- tekstkleur: color picker + HEX
- live ondersteunde fontkeuze
- eigen huisstijlfont duidelijk als productie-opmerking
- rotatie: slider + exact getal + presets 0/45/90/180 + magnetische snap binnen 3 graden
- SVG brononderdelen selecteren en groeperen met eigen groepsnaam

V5 groepslogica:
- Brononderdelen en Mijn groepen duidelijk gescheiden
- brononderdelen worden niet meer automatisch in het ontwerp gezet
- groep mag uit 1 onderdeel bestaan (dus woordmerk kan eigen groep zijn)
- eigen groepen hebben Gebruik / Hernoemen / Verwijderen
- per groep uitlijning Boven / Midden / Onder
- Alles op middenlijn voor één klik uitlijnen
- Complete logo blijft veilige intacte fallback

V6 hotfix:
- zichtbaar blok 'Mijn groepen' toegevoegd
- gemaakte groepen verschijnen direct onder Brononderdelen
- na groeperen scrollt de sidebar automatisch naar Mijn groepen
- brononderdelen vs gemaakte groepen duidelijker benoemd
