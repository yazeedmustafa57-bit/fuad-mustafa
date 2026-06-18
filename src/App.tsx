import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ContentGrid from './pages/ContentGrid';
import WatchPage from './pages/WatchPage';
import SportPage from './pages/SportPage';
import AdblockInfo from './pages/AdblockInfo';

type Page = 'home' | 'movies' | 'series' | 'search' | 'sport' | 'settings';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage('search');
    setSelectedItem(null);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    setCurrentPage(page as Page);
    setSelectedItem(null);
    if (page !== 'search') setSearchQuery('');
    try { document.exitFullscreen(); } catch(e) {}
  }, []);

  const handleSelect = useCallback((item: any) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try { document.documentElement.requestFullscreen(); } catch(e) {}
  }, []);

  if (selectedItem) {
    return (
      <div className="app">
        <WatchPage item={selectedItem} onBack={() => { setSelectedItem(null); try { document.exitFullscreen(); } catch(e) {} }} />
      </div>
    );
  }

  return (
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
                <div className="hero-badge">Willkommen bei</div>
                <h1 className="hero-title">Fuad Mustafa</h1>
                <p className="hero-subtitle">Stream & Watch Movies & TV Series</p>
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
                </div>
              </div>
            </section>
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">Trending</h2>
                <button className="section-link" onClick={() => handleNavigate('movies')}>Alle anzeigen →</button>
              </div>
              <ContentGrid type="trending" onSelect={handleSelect} />
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
          <p className="footer-powered">Powered by Fuad Mustafa</p>
          <p className="footer-copy">© 2024 Fuad Mustafa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
