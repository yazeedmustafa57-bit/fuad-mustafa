import React, { useEffect, useRef, useState } from 'react';

// hits.sh liefert SVG-Badge – als <img> geladen funktioniert CORS-frei
const HITS_URL = 'https://hits.sh/yazeedmustafa57-bit.github.io/fuad-mustafa/hits.svg';

const LiveCounter: React.FC = () => {
  const [online, setOnline] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // WebSocket für Online-Zähler (optional – nur wenn Server deployed)
  useEffect(() => {
    const wsUrl = getWsUrl();
    if (!wsUrl) return;

    let reconnectTimer: ReturnType<typeof setTimeout>;
    let mounted = true;

    function connect() {
      if (!mounted) return;
      try {
        const ws = new WebSocket(wsUrl as string);
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
    return null;
  }

  return (
    <span className="live-counter" title="Besucher">
      <span className="live-dot" />
      <span className="live-text">
        <img
          ref={imgRef}
          src={HITS_URL}
          alt="Besucher"
          className="hits-badge"
        />
        {online !== null && (
          <span className="live-online">
            <span className="online-dot" /> <span className="online-count">{online}</span> online
          </span>
        )}
      </span>
    </span>
  );
};

export default LiveCounter;
