import React, { useEffect, useState, useRef } from 'react';

const API = 'https://api.countapi.xyz';
const NS = 'fuad-mustafa';
const KEY_VISITORS = 'visitors';
const KEY_ONLINE = 'online';

const LiveCounter: React.FC = () => {
  const [visitors, setVisitors] = useState<number | null>(null);
  const [online, setOnline] = useState<number | null>(null);
  const onlineRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const apiGet = async (key: string) => {
      try {
        const res = await fetch(`${API}/get/${NS}/${key}`);
        const data = await res.json();
        return data.value;
      } catch {
        return null;
      }
    };

    const apiUpdate = async (key: string, amount: number) => {
      try {
        const res = await fetch(`${API}/update/${NS}/${key}?amount=${amount}`);
        const data = await res.json();
        return data.value;
      } catch {
        return null;
      }
    };

    const init = async () => {
      // Total visits – increment once per session
      const v = await apiUpdate(KEY_VISITORS, 1);
      if (mounted && v !== null) setVisitors(v);

      // Online – increment
      const o = await apiUpdate(KEY_ONLINE, 1);
      if (mounted && o !== null) setOnline(o);
      onlineRef.current = true;
    };

    const heartbeat = async () => {
      if (!mounted) return;
      const o = await apiGet(KEY_ONLINE);
      if (mounted && o !== null) setOnline(o);
    };

    const leave = async () => {
      if (!onlineRef.current) return;
      await apiUpdate(KEY_ONLINE, -1);
    };

    init();

    // Update online count every 30 seconds
    const hb = setInterval(heartbeat, 30000);

    // When page closes/unloads
    window.addEventListener('beforeunload', leave);

    return () => {
      mounted = false;
      clearInterval(hb);
      window.removeEventListener('beforeunload', leave);
      // If unmounting (not page unload), decrement
      leave();
    };
  }, []);

  return (
    <span className="live-counter">
      <span className="live-dot" />
      <span className="live-text">
        {online !== null ? online : '…'} online
      </span>
      <span className="live-sep">·</span>
      <span className="live-text">
        {visitors !== null ? visitors.toLocaleString() : '…'} gesamt
      </span>
    </span>
  );
};

export default LiveCounter;
