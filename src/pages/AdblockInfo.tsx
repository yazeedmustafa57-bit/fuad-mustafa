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
  },
  note: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginTop: '12px',
    lineHeight: 1.5,
  },
};

const AdblockInfo: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔇 Werbung blockieren</h1>
      <p style={styles.subtitle}>
        Mit AdGuard DNS wird Werbung auf deinem ganzen Gerät blockiert – 
        auch in den Videoplayern. Keine App-Installation nötig.
      </p>

      <div style={styles.step}>
        <div style={styles.stepTitle}><span style={styles.stepNum}>1</span> WLAN-Einstellungen öffnen</div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Gehe zu <strong>Einstellungen → WLAN / Wi-Fi</strong>
        </p>
      </div>

      <div style={styles.step}>
        <div style={styles.stepTitle}><span style={styles.stepNum}>2</span> Netzwerk bearbeiten</div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Tippe auf dein verbundenes WLAN-Netzwerk → <strong>DNS-Einstellungen</strong>
        </p>
      </div>

      <div style={styles.step}>
        <div style={styles.stepTitle}><span style={styles.stepNum}>3</span> DNS auf "Statisch" stellen</div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Wähle <strong>"Statisch"</strong> statt "Automatisch" und trage ein:
        </p>
        <div style={styles.code}>dns.adguard.com</div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Oder als IP-Adressen:
        </p>
        <div style={styles.code}>
          94.140.14.14<br/>94.140.15.15
        </div>
      </div>

      <div style={styles.step}>
        <div style={styles.stepTitle}><span style={styles.stepNum}>4</span> Speichern & fertig!</div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          Jetzt wird Werbung auf dem ganzen Gerät blockiert – 
          auch in allen Video-Playern dieser App.
        </p>
      </div>

      <p style={styles.note}>
        💡 Funktioniert auf Android, iPhone, Windows und Mac. 
        Einmal eingerichtet – dauerhaft werbefrei.
      </p>
    </div>
  );
};

export default AdblockInfo;
