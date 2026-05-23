import React from 'react';
import type { FooterData, ContactInfo } from '../../types';

interface FooterProps {
  data: FooterData;
  info: ContactInfo;
}

export const Footer: React.FC<FooterProps> = ({ data, info }) => {
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
              href={info.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="soc-btn"
              aria-label="Follow us on Instagram"
            >
              IG
            </a>
            <a
              href={info.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="soc-btn"
              aria-label="Chat with us on WhatsApp"
            >
              WA
            </a>
            <a
              href={info.mapUrl}
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
