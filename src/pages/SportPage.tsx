import React from 'react';

const SportPage: React.FC = () => {
  return (
    <div className="sport-page" style={{
      padding: '0',
      height: 'calc(100vh - 72px)',
      marginTop: '72px',
      overflow: 'hidden'
    }}>
      <iframe
        src="https://www.freekora.com"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Sport Live"
        allow="autoplay; fullscreen"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
};

export default SportPage;
