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
    const interval = setInterval(fetchHits, 60000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // Hide completely if nothing works, show "…" while loading
  if (error && visitors === null) {
    return (
      <span className="live-counter">
        <span className="live-dot disconnected" />
        <span className="live-text">-</span>
      </span>
    );
  }

  return (
    <span className="live-counter">
      <span className="live-dot" title="Live" />
      <span className="live-text">
        {visitors !== null ? `${visitors.toLocaleString()} Besucher` : '…'}
      </span>
    </span>
  );
};

export default LiveCounter;
