import React, { useEffect, useRef } from 'react';

const TIKTOK_VIDEO_ID = '7634885361398861078';

const TikTokEmbed: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TikTok embed script
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    script.onload = () => {
      // Re-trigger TikTok embed parsing
      const win = window as any;
      if (win.tiktok && win.tiktok.refresh) {
        win.tiktok.refresh();
      }
    };
    document.body.appendChild(script);
    return () => {
      const existing = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if (existing) document.body.removeChild(existing);
    };
  }, []);

  return (
    <section className="tiktok-showcase-section">
      <div className="section-header" style={{ textAlign: 'center' }}>
        <div className="hero-badge">Featured</div>
        <h2 className="section-title" style={{ fontSize: '1.6rem' }}>
          3D Video Showcase
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          marginTop: '4px',
        }}>
          Erlebe die nächste Dimension
        </p>
      </div>
      <div
        ref={containerRef}
        className="tiktok-embed-container"
      >
        <blockquote
          className="tiktok-embed"
          cite={`https://www.tiktok.com/@/video/${TIKTOK_VIDEO_ID}`}
          data-video-id={TIKTOK_VIDEO_ID}
          data-embed-from="embed_page"
          style={{
            maxWidth: '605px',
            minWidth: '325px',
            margin: '0 auto',
          }}
        >
          <section>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.tiktok.com/@/video/${TIKTOK_VIDEO_ID}`}
            >
              Auf TikTok ansehen
            </a>
          </section>
        </blockquote>
      </div>
    </section>
  );
};

export default TikTokEmbed;
