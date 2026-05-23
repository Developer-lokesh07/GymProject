import React from 'react';
import type { TimingsData } from '../../types';

interface TimingsProps {
  data: TimingsData;
}

export const Timings: React.FC<TimingsProps> = ({ data }) => {
  return (
    <section id="timings" aria-labelledby="timings-title">
      <div className="timings-inner">
        <div className="timings-header reveal">
          <div>
            <span className="section-eyebrow">{data.eyebrow}</span>
            <h2 className="section-title" id="timings-title" dangerouslySetInnerHTML={{ __html: data.titleHtml }}></h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.7 }}>
            {data.description}
          </p>
        </div>
        <div className="timings-grid reveal reveal-delay-1">
          {data.batches.map((batch, idx) => (
            <div key={idx} className={`time-card ${batch.isActive ? 'active' : ''}`} aria-label={`${batch.name} timing`}>
              <div className="time-shift">{batch.name}</div>
              <div className="time-display">{batch.time}</div>
              <div className="time-note">{batch.note}</div>
            </div>
          ))}
        </div>
        <div className="timings-closed reveal reveal-delay-2" role="note">
          <div className="closed-dot" aria-hidden="true"></div>
          <span dangerouslySetInnerHTML={{ __html: data.closedNote.replace('Sunday:', '<strong style="color:var(--text-secondary);">Sunday:</strong>') }}></span>
        </div>
      </div>
    </section>
  );
};
