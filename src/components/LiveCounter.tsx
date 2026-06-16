import React, { useEffect, useState, useRef } from 'react';

const WS_URL = 'wss://fuad-mustafa-live.onrender.com/ws';
const HITS_URL = 'https://hits.sh/yazeedmustafa57-bit.github.io/fuad-mustafa/hits.svg';

const LiveCounter: React.FC = () => {
  const [online, setOnline] = useState<number | null>(null);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const connectWs = () => {
      if (!mounted) return;
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) { ws.close(); return; }
          setConnected(true);
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'online') {
              setOnline(data.count);
            }
          } catch {}
        };

        ws.onclose = () => {
          if (!mounted) return;
          setConnected(false);
          // Reconnect after 5 seconds
          setTimeout(connectWs, 5000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        // WebSocket not available
      }
    };

    // Heartbeat every 25 seconds
    pingRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);

    connectWs();

    return () => {
      mounted = false;
      if (pingRef.current) clearInterval(pingRef.current);
      wsRef.current?.close();
    };
  }, []);

  // Fetch total visitors from hits.sh
  useEffect(() => {
    let mounted = true;
    const fetchHits = async () => {
      try {
        const res = await fetch(HITS_URL);
        const svg = await res.text();
        const match = svg.match(/hits:\s*(\d+)/i);
        if (match && mounted) {
          setVisitors(parseInt(match[1], 10));
        }
      } catch {}
    };
    fetchHits();
    const interval = setInterval(fetchHits, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <span className="live-counter">
      <span className={`live-dot ${connected ? '' : 'disconnected'}`} />
      <span className="live-text">
        {online !== null ? `${online} online` : '…'}
      </span>
      <span className="live-sep">·</span>
      <span className="live-text">
        {visitors !== null ? `${visitors.toLocaleString()} gesamt` : '…'}
      </span>
    </span>
  );
};

export default LiveCounter;
