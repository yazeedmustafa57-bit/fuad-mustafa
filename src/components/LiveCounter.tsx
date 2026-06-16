import React, { useEffect, useState, useRef } from 'react';

const HITS_URL = 'https://hits.sh/yazeedmustafa57-bit.github.io/fuad-mustafa/hits.svg';

const LiveCounter: React.FC = () => {
  const [online, setOnline] = useState<number | null>(null);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<any>(null);
  const pingRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    let reconnectTimer: any = null;

    const connectWs = () => {
      if (!mounted) return;
      try {
        // Use wss:// protocol - secure WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = 'fuad-mustafa-live.onrender.com';
        const ws = new WebSocket(`${protocol}//${host}/ws`);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) { ws.close(); return; }
          setConnected(true);
        };

        ws.onmessage = (event: MessageEvent) => {
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
          reconnectTimer = setTimeout(connectWs, 5000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {}
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
      if (reconnectTimer) clearTimeout(reconnectTimer);
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
