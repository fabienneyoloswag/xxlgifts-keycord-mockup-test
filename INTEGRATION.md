# Offerteaanvraag-integratie

De huidige offerteflow is bewust een demo en verstuurt niets.

## Frontendcontract

De editor maakt één `FormData`-object met:

| veld | type | inhoud |
|---|---|---|
| `request` | JSON-bestand | volledige configuratie en klantgegevens |
| `mockup` | PNG-bestand | actuele canvasimpressie |
| `logo` | origineel bestand | alleen bij één herhaald logo |
| `front` | origineel bestand | ontwerp voorste lint |
| `back` | origineel bestand | ontwerp teruglopende lint |
| `continuous` | origineel bestand | volledig doorlopend ontwerp |

## Gewenst endpoint

`POST /api/quote-request`

Content-Type wordt automatisch `multipart/form-data`.

Voorbeeld frontendkoppeling:

```js
const response = await fetch('/api/quote-request', {
  method: 'POST',
  body: formData
});

const result = await response.json();

if (!response.ok || !result.success) {
  throw new Error(result.message || 'Aanvraag kon niet worden verstuurd.');
}
```

## Verwachte succesvolle respons

```json
{
  "success": true,
  "requestId": "K-2026-00124"
}
```

## Verwachte foutrespons

```json
{
  "success": false,
  "message": "E-mailadres ontbreekt."
}
```

## Serverwerk voor Guus

1. multipart-formulier ontvangen;
2. klantvelden valideren;
3. originele uploads veilig opslaan of als bijlagen verwerken;
4. aanvraagmail naar het ingestelde XXLGifts-adres sturen;
5. optioneel bevestigingsmail naar klant sturen;
6. uniek aanvraagnummer genereren;
7. JSON-respons teruggeven.

De functie `prepareQuoteRequest()` in `app.js` maakt nu al exact de benodigde `FormData`. Alleen de demo-uitvoer moet later door de `fetch()` hierboven worden vervangen.
