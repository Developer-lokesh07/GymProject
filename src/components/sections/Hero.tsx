import type { HeroData } from '../../types';

interface HeroProps {
  data: HeroData;
}

export const Hero: React.FC<HeroProps> = ({ data }) => {
  return (
    <section id="hero" aria-label="Hero">
      <div className="hero-bg-pattern" aria-hidden="true"></div>
      <div className="hero-left">
        <span className="hero-eyebrow">{data.eyebrow}</span>
        <h1 className="hero-title">
          <span className="line-1">{data.titleLines[0]}</span>
          <br />
          <span className="line-2">{data.titleLines[1]}</span>
          <br />
          <span className="line-3">{data.titleLines[2]}</span>
        </h1>
        <p className="hero-sub">{data.subtitle}</p>
        <div className="hero-ctas">
          <a href="#contact" className="btn-accent">
            Start Free Trial
          </a>
          <a href="#facilities" className="btn-ghost">
            Explore Facilities
          </a>
        </div>
        <div className="hero-stats-mini" aria-label="Quick stats">
          {data.stats.map((stat, idx) => (
            <div key={idx} className="hero-stat-item">
              <span className="hero-stat-num">
                {stat.value.includes('.') ? (
                  <>
                    {stat.value.split('.')[0]}.<span>{stat.value.split('.')[1]}</span>
                    {stat.suffix}
                  </>
                ) : (
                  <>
                    {stat.value}
                    <span>{stat.suffix}</span>
                  </>
                )}
              </span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-right" aria-hidden="true">
        {/* Premium gym photography replaces the old CSS geometry */}
        <img
          src="/images/hero-gym-floor.png"
          alt=""
          className="hero-photo"
          loading="eager"
          fetchPriority="high"
        />
        {/* Gradient overlay for readability */}
        <div className="hero-photo-overlay"></div>
        <div className="hero-badge-stamp" aria-hidden="true">
          <span className="stamp-num">{data.badge.rating}</span>
          <span className="stamp-stars">{data.badge.stars}</span>
          <span className="stamp-text">{data.badge.text}</span>
        </div>
      </div>
    </section>
  );
};
