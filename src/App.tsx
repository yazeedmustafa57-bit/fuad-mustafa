import React, { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { t } from './i18n';
import type { Language } from './i18n';
import Header from './components/Header';
import ContentGrid from './pages/ContentGrid';
import WatchPage from './pages/WatchPage';
import SportPage from './pages/SportPage';
import AdblockInfo from './pages/AdblockInfo';

const LangContext = createContext<{ lang: Language; setLang: (l: Language) => void }>({ lang: 'de', setLang: () => {} });
export const useLang = () => useContext(LangContext);

type Page = 'home' | 'movies' | 'series' | 'search' | 'sport' | 'settings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [lang, setLang] = useState<Language>('de');
  const [adBlockActive, setAdBlockActive] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  // Service Worker Ad-Blocking Status
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'adBlockStatus') {
          setAdBlockActive(event.data.active);
        }
      });
    }
  }, []);

  const toggleAdBlock = useCallback(() => {
    const newState = !adBlockActive;
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'toggleAdBlock',
        active: newState,
      });
    }
    setAdBlockActive(newState);
    if (newState) {
      setShowAdModal(true);
      setTimeout(() => setShowAdModal(false), 5000);
    }
  }, [adBlockActive]);

  const handleAdBlockClick = useCallback(() => {
    toggleAdBlock();
    handleNavigate('settings');
  }, [toggleAdBlock]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage('search');
    setSelectedItem(null);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as Page);
    setSelectedItem(null);
    if (page !== 'search') setSearchQuery('');
  }, []);

  const handleSelect = useCallback((item: any) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (selectedItem) {
    return (
      <LangContext.Provider value={{ lang, setLang }}>
      <div className="app">
        <WatchPage item={selectedItem} onBack={() => setSelectedItem(null)} />
      </div>
      </LangContext.Provider>
    );
  }

  return (
      <LangContext.Provider value={{ lang, setLang }}>
    <div className="app">
      <Header
        onSearch={handleSearch}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />
      <main className="main">
        {currentPage === 'home' && (
          <>
            <section className="hero-section">
              <div className="hero-bg" />
              <div className="hero-content">
                <div className="hero-badge">{t('hero.welcome', lang)}</div>
                <h1 className="hero-title">Fuad Mustafa</h1>
                <p className="hero-subtitle">{t('hero.subtitle', lang)}</p>
                <div className="hero-actions">
                  <button className="hero-btn hero-btn-primary" onClick={() => handleNavigate('movies')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Filme entdecken
                  </button>
                  <button className="hero-btn hero-btn-secondary" onClick={() => handleNavigate('series')}>
                    Serien entdecken
                  </button>
                  <button
                    className={`hero-btn hero-btn-adblock ${adBlockActive ? 'active' : ''}`}
                    onClick={handleAdBlockClick}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    {adBlockActive ? t('hero.adblock.active', lang) : t('hero.adblock', lang)}
                  </button>
                </div>
              </div>
            </section>

            {/* Ad-Block Success Modal */}
            {showAdModal && (
              <div className="adblock-modal-overlay" onClick={() => setShowAdModal(false)}>
                <div className="adblock-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="adblock-modal-icon">🛡️</div>
                  <h3 className="adblock-modal-title">{t('modal.title', lang)}</h3>
                  <p className="adblock-modal-text">
                    Popup-Blocker und Ad-Blocking sind aktiv. 
                    Für kompletten Werbeschutz auf dem ganzen Gerät 
                    richte <strong>AdGuard DNS</strong> in den Einstellungen ein.
                  </p>
                  <div className="adblock-modal-actions">
                    <button className="hero-btn hero-btn-primary" onClick={() => { setShowAdModal(false); handleNavigate('settings'); }}>
                      DNS-{t('dns.button', lang)} öffnen
                    </button>
                    <button className="hero-btn hero-btn-secondary" onClick={() => setShowAdModal(false)}>
                      Schließen
                    </button>
                  </div>
                </div>
              </div>
            )}

            <section className="section">
              <div className="section-header">
                <h2 className="section-title">{t('section.trending', lang)}</h2>
                <button className="section-link" onClick={() => handleNavigate('movies')}>{t('section.showAll', lang)}</button>
              </div>
              <ContentGrid type="trending" onSelect={handleSelect} />
          {/* DNS Werbeblocker Banner */}
          <div className="dns-banner">
            <div className="dns-banner-content">
              <span className="dns-banner-icon">🔇</span>
              <div className="dns-banner-text">
                <strong>{t('dns.title', lang)}</strong>
                <p>{t('dns.instruction', lang)} <code>dns.adguard.com</code></p>
              </div>
              <button className="dns-banner-btn" onClick={() => handleNavigate('settings')}>{t('dns.button', lang)}</button>
            </div>
          </div>
            </section>
          </>
        )}
        {currentPage === 'movies' && <ContentGrid type="movies" onSelect={handleSelect} />}
        {currentPage === 'series' && <ContentGrid type="series" onSelect={handleSelect} />}
        {currentPage === 'search' && <ContentGrid type="search" searchQuery={searchQuery} onSelect={handleSelect} />}
        {currentPage === 'sport' && <SportPage />}
        {currentPage === 'settings' && <AdblockInfo />}
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <div className="logo-flag small">
              <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
                <rect width="90" height="20" fill="#CE1126"/>
                <rect y="20" width="90" height="20" fill="#FFF"/>
                <rect y="40" width="90" height="20" fill="#007A3D"/>
                <circle cx="45" cy="30" r="7" fill="#FCD116"/><g fill="#FCD116" transform="translate(45,30)"><polygon points="0,-9 1,-13 -1,-13"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(17.14)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(34.29)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(51.43)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(68.57)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(85.71)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(102.86)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(120.00)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(137.14)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(154.29)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(171.43)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(188.57)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(205.71)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(222.86)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(240.00)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(257.14)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(274.29)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(291.43)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(308.57)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(325.71)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(342.86)"/></g>
              </svg>
            </div>
            <span>Fuad Mustafa</span>
          </div>
          <p className="footer-powered">{t('footer.powered', lang)}</p>
          <p className="footer-copy">{t('footer.copyright', lang)}</p>
        </div>
      </footer>
    </div>
      </LangContext.Provider>
  );
};

export default App;
