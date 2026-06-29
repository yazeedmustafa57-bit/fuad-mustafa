import React from 'react';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: '72px',
    padding: '40px 24px',
    maxWidth: '700px',
    margin: '72px auto 0',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
    fontFamily: 'Playfair Display, serif',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginBottom: '32px',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  step: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
  },
  stepNum: {
    display: 'inline-block',
    background: 'var(--accent-red)',
    color: '#fff',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    textAlign: 'center' as const,
    lineHeight: '28px',
    fontSize: '0.85rem',
    fontWeight: 700,
    marginRight: '12px',
  },
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '8px',
  },
  code: {
    background: 'rgba(255,255,255,0.08)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    color: 'var(--accent-gold)',
    margin: '12px 0',
    wordBreak: 'break-all' as const,
    cursor: 'pointer',
  },
  note: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginTop: '12px',
    lineHeight: 1.5,
  },
  copyBtn: {
    background: 'var(--accent-red)',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '8px',
  },
  deviceBtn: {
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginRight: '8px',
    marginBottom: '8px',
  },
  deviceBtnActive: {
    background: 'var(--accent-red)',
    color: '#fff',
    border: '1px solid var(--accent-red)',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginRight: '8px',
    marginBottom: '8px',
  },
};

const copyToClipboard = (text: string) => {
  try {
    navigator.clipboard.writeText(text);
    alert('✅ Kopiert: ' + text);
  } catch {
    alert('Bitte manuell kopieren: ' + text);
  }
};

const AdblockInfo: React.FC = () => {
  const [device, setDevice] = React.useState<'android' | 'iphone'>('android');

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔇 Werbung blockieren</h1>
      <p style={styles.subtitle}>
        Mit AdGuard DNS wird Werbung auf deinem ganzen Gerät blockiert – 
        auch in den Videoplayern. Keine App-Installation nötig.
      </p>

      <div style={{ marginBottom: '24px' }}>
        <strong style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Wähle dein Gerät:</strong>
        <button
          style={device === 'android' ? styles.deviceBtnActive : styles.deviceBtn}
          onClick={() => setDevice('android')}
        >
          📱 Android
        </button>
        <button
          style={device === 'iphone' ? styles.deviceBtnActive : styles.deviceBtn}
          onClick={() => setDevice('iphone')}
        >
          📱 iPhone/iPad
        </button>
      </div>

      {device === 'android' ? (
        <>
          <div style={styles.step}>
            <div style={styles.stepTitle}><span style={styles.stepNum}>1</span> Einstellungen öffnen</div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Gehe zu <strong>Einstellungen → Verbindungen → WLAN</strong>
            </p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepTitle}><span style={styles.stepNum}>2</span> Netzwerk bearbeiten</div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Tippe auf das <strong>Zahnrad ⚙️</strong> neben deinem WLAN-Netzwerk
            </p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepTitle}><span style={styles.stepNum}>3</span> DNS-Einstellungen</div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Scrolle runter → <strong>DNS</strong> → auf <strong>"Statisch"</strong> stellen
            </p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepTitle}><span style={styles.stepNum}>4</span> DNS-Adresse eingeben</div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Tippe ein (DNS1):
            </p>
            <div style={styles.code} onClick={() => copyToClipboard('94.140.14.14')}>
              94.140.14.14
            </div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Tippe ein (DNS2):
            </p>
            <div style={styles.code} onClick={() => copyToClipboard('94.140.15.15')}>
              94.140.15.15
            </div>
            <button style={styles.copyBtn} onClick={() => copyToClipboard('94.140.14.14\n94.140.15.15')}>
              📋 Beide kopieren
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={styles.step}>
            <div style={styles.stepTitle}><span style={styles.stepNum}>1</span> Einstellungen öffnen</div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Gehe zu <strong>Einstellungen → WLAN</strong>
            </p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepTitle}><span style={styles.stepNum}>2</span> Netzwerk bearbeiten</div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Tippe auf das <strong>(i)</strong> neben deinem WLAN-Netzwerk
            </p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepTitle}><span style={styles.stepNum}>3</span> DNS konfigurieren</div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Scrolle runter zu <strong>DNS</strong> → <strong>"Manuell"</strong> wählen
            </p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepTitle}><span style={styles.stepNum}>4</span> AdGuard DNS eintragen</div>
            <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
              Lösche alte Einträge und tippe ein:
            </p>
            <div style={styles.code} onClick={() => copyToClipboard('dns.adguard.com')}>
              dns.adguard.com
            </div>
            <button style={styles.copyBtn} onClick={() => copyToClipboard('dns.adguard.com')}>
              📋 Kopieren
            </button>
          </div>
        </>
      )}

      <div style={styles.step}>
        <div style={styles.stepTitle}>✅ Fertig – Werbefrei!</div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Jetzt werden auf deinem ganzen Gerät keine Werbung mehr angezeigt – 
          auch nicht in den Video-Playern. Die Filme und Serien laufen normal weiter!
        </p>
      </div>

      <p style={styles.note}>
        💡 Einmal eingerichtet – dauerhaft werbefrei. 
        Funktioniert auf Android, iPhone, Windows und Mac.
      </p>
    </div>
  );
};

export default AdblockInfo;
