import React, { useEffect, useState } from 'react';

const HITS_URL = 'https://hits.sh/yazeedmustafa57-bit.github.io/fuad-mustafa/hits.svg';

const LiveCounter: React.FC = () => {
  const [visitors, setVisitors] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchHits = async () => {
      try {
        const res = await fetch(HITS_URL);
        const svg = await res.text();
        // Parse the hit count from SVG <title>hits: X</title>
        const match = svg.match(/hits:\s*(\d+)/i);
        if (match && mounted) {
          setVisitors(parseInt(match[1], 10));
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      }
    };

    fetchHits();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHits, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (error && visitors === null) return null; // Hide if nothing works

  return (
    <span className="live-counter">
      <span className="live-dot" title="Seite ist live/online" />
      <span className="live-text">
        {visitors !== null ? `${visitors.toLocaleString()} Besucher` : '…'}
      </span>
    </span>
  );
};

export default LiveCounter;
