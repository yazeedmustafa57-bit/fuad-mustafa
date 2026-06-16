# WebSocket-Server deployen (für "X online" Zähler)

## Option 1: Render (Empfohlen - Kostenlos, kein Kreditkarte)

1. Gehe zu https://dashboard.render.com/
2. Klicke auf "New +" > "Blueprint"
3. Verbinde dein GitHub Repository `yazeedmustafa57-bit/fuad-mustafa`
4. Render liest die `render.yaml` und erstellt den WebSocket-Server automatisch
5. Nach dem Deployment bekommst du eine URL wie `https://fuad-mustafa-live.onrender.com`
6. Setze diese URL als Umgebungsvariable beim Build:
   ```
   VITE_WS_URL=wss://fuad-mustafa-live.onrender.com/ws
   ```
7. Baue die Seite neu und deploye zu GitHub Pages

## Option 2: Railway

1. Gehe zu https://railway.app/
2. Klicke "New Project" > "Deploy from GitHub repo"
3. Wähle `yazeedmustafa57-bit/fuad-mustafa`
4. Setze Root Directory auf `server`
5. Start Command: `node index.js`
6. Nach Deployment: Setze `VITE_WS_URL` in den Frontend-Build

## Option 3: Lokal Testen

```bash
cd server
npm install
node index.js
# Server läuft auf ws://localhost:3001/ws
```

## Nach dem Deployment

1. Setze `VITE_WS_URL=wss://deine-server-url/ws`
2. Baue neu: `npm run build`
3. Pushe zu GitHub → automatischer Deploy
