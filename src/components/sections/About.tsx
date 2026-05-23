import type { AboutData } from '../../types';

interface AboutProps {
  data: AboutData;
}

export const About: React.FC<AboutProps> = ({ data }) => {
  return (
    <section id="about" aria-labelledby="about-title">
      <div className="about-visual reveal">
        {/* Premium gym community photography replaces old CSS squares */}
        <img
          src="/images/about-gym-community.png"
          alt="Members training together at Conqueror Fitness Hub"
          className="about-photo"
          loading="lazy"
        />
        <div className="about-photo-overlay"></div>
        <div className="about-badge">
          <div className="about-badge-n">{data.badge.rating}</div>
          <div className="about-badge-t">{data.badge.text}</div>
        </div>
      </div>
      <div className="about-text reveal reveal-delay-2">
        <span className="section-eyebrow">{data.eyebrow}</span>
        <h2
          className="section-title"
          id="about-title"
          dangerouslySetInnerHTML={{ __html: data.titleHtml }}
        ></h2>
        <div className="section-rule" aria-hidden="true"></div>
        {data.paragraphs.map((para, idx) => (
          <p key={idx} className="section-body" style={{ marginBottom: idx === 0 ? '16px' : '0' }}>
            {para}
          </p>
        ))}

        <div className="about-features" role="list">
          {data.features.map((feat, idx) => (
            <div key={idx} className="about-feat" role="listitem">
              <div className="feat-icon-box" aria-hidden="true">
                {feat.icon}
              </div>
              <div className="feat-label">{feat.title}</div>
              <div className="feat-sub">{feat.description}</div>
            </div>
          ))}
        </div>
        <a
          href="#contact"
          className="btn-accent"
          style={{ marginTop: '32px', display: 'inline-block' }}
        >
          Book a Free Visit
        </a>
      </div>
    </section>
  );
};
