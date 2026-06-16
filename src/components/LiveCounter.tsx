import React, { useEffect, useState, useRef } from 'react';

// hits.sh zeigt "hits: X" als SVG-Badge – via <img> kein CORS-Problem
const HITS_URL = 'https://hits.sh/yazeedmustafa57-bit.github.io/fuad-mustafa/hits.svg';

const LiveCounter: React.FC = () => {
  const [visitors, setVisitors] = useState<number | null>(null);
  const [online, setOnline] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // hits.sh Wert per fetch (mit Proxy) auslesen, Fallback auf <img>
    const fetchWithProxy = async () => {
      try {
        // CORS-Proxy um SVG zu parsen
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(HITS_URL)}`;
        const res = await fetch(proxyUrl);
        const svg = await res.text();
        const match = svg.match(/hits:\s*(\d+)/i);
        if (match) {
          setVisitors(parseInt(match[1], 10));
          return;
        }
      } catch {
        // Proxy nicht erreichbar
      }
      // Fallback: null, dann zeigen wir das <img>
      setVisitors(null);
    };

    fetchWithProxy();
    const interval = setInterval(fetchWithProxy, 120000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket-Verbindung für Online-Zähler
  useEffect(() => {
    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    let reconnectTimer: ReturnType<typeof setTimeout>;
    let mounted = true;

    function connect() {
      if (!mounted) return;
      try {
        const ws = new WebSocket(wsUrl!);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[LiveCounter] WebSocket verbunden');
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data.type === 'online' && mounted) {
              setOnline(data.count);
            }
          } catch {}
        };

        ws.onclose = () => {
          if (mounted) {
            setOnline(null);
            reconnectTimer = setTimeout(connect, 10000);
          }
        };

        ws.onerror = () => {};
      } catch {}
    }

    // Heartbeat alle 25s
    const heartbeat = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    connect();

    return () => {
      mounted = false;
      clearTimeout(reconnectTimer);
      clearInterval(heartbeat);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  function getWsUrl(): string | null {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:3001/ws';
    }
    // Nach Deployment: hier die WebSocket-URL eintragen oder via env
    return null;
  }

  return (
    <span className="live-counter" title="Besucher">
      <span className="live-dot" />
      <span className="live-text">
        {visitors !== null ? (
          <>{visitors.toLocaleString()} Besucher</>
        ) : (
          <img src={HITS_URL} alt="Besucher" className="hits-badge" />
        )}
        {online !== null && (
          <span className="live-online">
            <span className="online-dot" /> {online} online
          </span>
        )}
      </span>
    </span>
  );
};

export default LiveCounter;
