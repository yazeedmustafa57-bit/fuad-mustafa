import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, currentPage, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const navItems = [
    { id: 'home', label: 'Start' },
    { id: 'movies', label: 'Filme' },
    { id: 'series', label: 'Serien' },
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <div className="logo" onClick={() => { onNavigate('home'); setMobileMenu(false); }}>
          <div className="logo-flag">
            <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
              <rect width="90" height="20" fill="#CE1126"/>
              <rect y="20" width="90" height="20" fill="#FFF"/>
              <rect y="40" width="90" height="20" fill="#007A3D"/>
              <circle cx="45" cy="30" r="10" fill="#CE1126"/>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">Fuad Mustafa</span>
            <span className="logo-sub">Movies & Series</span>
          </div>
        </div>

        <nav className={`nav ${mobileMenu ? 'open' : ''}`}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => { onNavigate(item.id); setMobileMenu(false); }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Filme & Serien suchen..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </form>

        <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
          <span className={`hamburger ${mobileMenu ? 'open' : ''}`}>
            <span/><span/><span/>
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
