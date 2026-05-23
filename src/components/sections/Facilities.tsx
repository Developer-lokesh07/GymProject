import React from 'react';
import type { FacilitiesData } from '../../types';

interface FacilitiesProps {
  data: FacilitiesData;
}

export const Facilities: React.FC<FacilitiesProps> = ({ data }) => {
  return (
    <section id="facilities" aria-labelledby="facilities-title">
      <div className="sec-bg-num" aria-hidden="true">06</div>
      <div className="facilities-inner">
        <div className="facilities-header reveal">
          <div>
            <span className="section-eyebrow">{data.eyebrow}</span>
            <h2 className="section-title" id="facilities-title" dangerouslySetInnerHTML={{ __html: data.titleHtml }}></h2>
          </div>
          <a href="#contact" style={{ fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            Book a Tour →
          </a>
        </div>
        <div className="fac-grid reveal reveal-delay-1">
          {data.items.map((item, idx) => (
            <article key={idx} className="fac-card">
              <div className="fac-num">{item.num}</div>
              <div className="fac-icon" aria-hidden="true">{item.icon}</div>
              <h3 className="fac-name">{item.title}</h3>
              <p className="fac-desc">{item.desc}</p>
              <span className="fac-badge">{item.badge}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
