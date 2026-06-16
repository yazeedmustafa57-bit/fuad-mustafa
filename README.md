# Fuad Mustafa - Movies & TV Series Streaming

## Live Besucherzähler aktivieren

Um den **Live "Online jetzt" Zähler** zu aktivieren, muss der WebSocket-Server auf **Render** (kostenlos) deployed werden:

### Einmalige Einrichtung (2 Minuten):

1. Gehe zu **https://dashboard.render.com** und registriere dich mit **GitHub** (kostenlos, keine Kreditkarte)
2. Klicke auf **"New +" → "Web Service"**
3. Wähle dein GitHub Repository: `yazeedmustafa57-bit/fuad-mustafa`
4. Render erkennt automatisch:
   - **Root Directory:** `server`
   - **Start Command:** `node index.js`
5. Klicke **"Create Web Service"**
6. Nach ~2 Minuten ist der Server live unter: `https://fuad-mustafa-live.onrender.com`

### Nach dem Deployment:

Sobald der Server läuft, aktualisiere ich die WebSocket-URL im React-Code, damit deine Seite die "Online jetzt" Zahlen anzeigt.

---

### Entwicklung

```bash
npm install
npm run build    # Build für Produktion
cp -r dist/ docs/
git push
```
