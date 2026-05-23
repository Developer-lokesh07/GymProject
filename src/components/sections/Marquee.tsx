import React from 'react';

interface MarqueeProps {
  items: string[];
}

export const Marquee: React.FC<MarqueeProps> = ({ items }) => {
  return (
    <div className="marquee-strip" aria-hidden="true">
      <div className="marquee-track">
        {/* We duplicate the items 3 times so the animation loops seamlessly seamlessly */}
        {[...Array(3)].map((_, groupIdx) => (
          <div key={groupIdx} style={{ display: 'flex' }}>
            {items.map((item, idx) => (
              <div key={`${groupIdx}-${idx}`} className="marquee-item">
                <span className="marquee-diamond">♦</span>
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
