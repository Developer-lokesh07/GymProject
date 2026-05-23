import React, { useEffect, useRef, useState } from 'react';
import type { StatsBannerItem } from '../../types';

interface StatsBannerProps {
  data: StatsBannerItem[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ data }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stats-row" role="region" aria-label="Key statistics" ref={ref}>
      {data.map((stat, idx) => (
        <div key={idx} className="stat-cell">
          <StatCounter
            target={stat.target}
            isDecimal={stat.isDecimal}
            suffix={stat.suffix}
            start={inView}
          />
          <span className="stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
};

// Extracted the count-up logic into a clean React component
const StatCounter: React.FC<{
  target: number;
  isDecimal: boolean;
  suffix: string;
  start: boolean;
}> = ({ target, isDecimal, suffix, start }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let current = 0;
    const duration = 1800;
    const step = target / (duration / 16);

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [start, target]);

  return (
    <span className="stat-number">
      {isDecimal ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  );
};
