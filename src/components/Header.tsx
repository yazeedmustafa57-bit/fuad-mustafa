import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, currentPage, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
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
    { id: 'sport', label: 'Sport ⚽' },
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <div className="logo" onClick={() => onNavigate('home')}>
          <div className="logo-flag">
            <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg">
              <rect width="90" height="20" fill="#CE1126"/>
              <rect y="20" width="90" height="20" fill="#FFF"/>
              <rect y="40" width="90" height="20" fill="#007A3D"/>
              <circle cx="45" cy="30" r="7" fill="#FCD116"/><g fill="#FCD116" transform="translate(45,30)"><polygon points="0,-9 1,-13 -1,-13"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(17.14)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(34.29)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(51.43)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(68.57)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(85.71)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(102.86)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(120.00)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(137.14)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(154.29)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(171.43)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(188.57)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(205.71)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(222.86)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(240.00)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(257.14)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(274.29)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(291.43)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(308.57)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(325.71)"/><polygon points="0,-9 1,-13 -1,-13" transform="rotate(342.86)"/></g>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-name">Fuad Mustafa</span>
            <span className="logo-sub">Movies & Series</span>
          </div>
        </div>

        <nav className="nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
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
      </div>
    </header>
  );
};

export default Header;
