import React, { useEffect, useState } from 'react';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Intersection Observer for scroll spy
    const sections = document.querySelectorAll('section[id], div[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' },
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const closeMobileMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const nextState = !menuOpen;
    setMenuOpen(nextState);
    document.body.style.overflow = nextState ? 'hidden' : '';
  };

  const links = [
    { name: 'About', id: 'about' },
    { name: 'Facilities', id: 'facilities' },
    { name: 'Timings', id: 'timings' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'Reviews', id: 'reviews' },
    { name: 'Contact', id: 'contact' },
  ];

  return (
    <>
      <div
        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
        id="mobile-menu"
        role="dialog"
        aria-label="Navigation menu"
      >
        {links.map((link) => (
          <a key={link.id} className="nav-link" href={`#${link.id}`} onClick={closeMobileMenu}>
            {link.name}
          </a>
        ))}
        <a href="#contact" className="nav-cta" onClick={closeMobileMenu}>
          Join Now
        </a>
      </div>

      <header className={`nav ${scrolled ? 'scrolled' : ''}`} id="nav" role="banner">
        <div className="nav-inner">
          <a href="#" className="nav-logo" aria-label="Conqueror Fitness Hub home">
            <span className="nav-logo-main">
              CONQUEROR<span className="nav-logo-dot" aria-hidden="true"></span>
            </span>
            <span className="nav-logo-sub">Fitness Hub · Jalgaon</span>
          </a>
          <nav className="nav-links" aria-label="Main navigation">
            {links.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="nav-right">
            <a href="tel:+918669084921" className="nav-phone" aria-label="Call us">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
              </svg>
              +91 86690 84921
            </a>
            <a href="#contact" className="nav-cta">
              Join Now
            </a>
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              id="hamburger"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={toggleMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
