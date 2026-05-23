import React from 'react';
import type { FooterData } from '../../types';

interface FooterProps {
  data: FooterData;
}

export const Footer: React.FC<FooterProps> = ({ data }) => {
  return (
    <footer aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-col" style={{ gridColumn: 'span 1' }}>
            <a href="#" className="footer-logo" aria-label="Conqueror Fitness Hub home">
              CONQUEROR<span className="dot" aria-hidden="true"></span>
            </a>
            <div className="footer-sub">Fitness Hub · Jalgaon</div>
            <p className="footer-desc">{data.brandDesc}</p>
          </div>

          {Object.entries(data.links).map(([section, links]) => (
            <div key={section} className="footer-col">
              <h5>{section}</h5>
              <ul aria-label={`${section} links`}>
                {links.map((link, idx) => (
                  <li key={idx}>
                    <a href={link.url}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col">
            <h5>Legal</h5>
            <ul aria-label="Legal links">
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms & Conditions</a>
              </li>
              <li>
                <a href="#">Gym Rules</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">{data.copy}</div>
          <div className="social-row" aria-label="Social media links">
            <a
              href="https://instagram.com/conqueror_fitness_hub"
              target="_blank"
              rel="noopener noreferrer"
              className="soc-btn"
              aria-label="Follow us on Instagram"
            >
              IG
            </a>
            <a
              href="https://wa.me/918669084921"
              target="_blank"
              rel="noopener noreferrer"
              className="soc-btn"
              aria-label="Chat with us on WhatsApp"
            >
              WA
            </a>
            <a
              href="https://maps.app.goo.gl/Dt7G9R6vpVnsK47H9"
              target="_blank"
              rel="noopener noreferrer"
              className="soc-btn"
              aria-label="Find us on Google Maps"
            >
              GM
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
