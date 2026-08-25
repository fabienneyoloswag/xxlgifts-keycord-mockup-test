# Assets

Alle bestandsnamen gebruiken kleine letters en koppeltekens. Zo werkt de repository hetzelfde op macOS, Windows, Linux en Vercel.

## Mapstructuur

```text
assets/
├── branding/                     logo's en huisstijl
├── keycords/
│   ├── 10mm/normal/preview.png
│   ├── 15mm/normal/preview.png
│   ├── 20mm/
│   │   ├── normal/               standaard 20mm-afbeeldingen
│   │   ├── safety/               20mm met safety-sluiting
│   │   ├── buckle/               20mm met buckle
│   │   ├── buckle-safety/        20mm met buckle en safety
│   │   └── custom/               vrije plek voor nieuwe 20mm-types
│   └── 25mm/normal/preview.png
├── hooks/                        productfoto's van haken
├── accessories/                  buckle, safety en andere accessoires
├── materials/                    materiaal- en drukvoorbeelden
├── reference/                    referentiebeelden zoals breedtes
└── engine/
    └── 20mm/normal/
        ├── layers/               lagen voor de technische mockup-engine
        ├── hooks/                transparante haaklagen voor de engine
        └── legacy/               oudere, ongebruikte enginebestanden
```

## Nieuwe 20mm-afbeeldingen toevoegen

1. Bestaand type: zet een vervangende of aanvullende afbeelding in de passende map onder `keycords/20mm/`.
2. Nieuw type: maak een map met een korte naam in kleine letters, bijvoorbeeld `keycords/20mm/dubbele-haak/`.
3. Gebruik `preview.png` voor de hoofdafbeelding. Aanvullende beelden krijgen duidelijke namen zoals `detail-voorzijde.png`.
4. Voeg een klantgerichte variant pas aan `keycord-editor/index.html` toe als die ook echt kiesbaar moet worden.
5. Voor een nieuwe technische enginevariant: maak dezelfde onderverdeling in `engine/<breedte>/<type>/` en voeg de paden toe aan `templates.json`.

Plaats geen nieuwe afbeeldingen meer in de hoofdmap of rechtstreeks in een routemap. De routes delen de bestanden vanuit deze map.
