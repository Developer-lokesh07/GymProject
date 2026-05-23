import React from 'react';
import type { PricingData } from '../../types';

interface PricingProps {
  data: PricingData;
  onPlanSelect: (planValue: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ data, onPlanSelect }) => {
  return (
    <section id="pricing" aria-labelledby="pricing-title">
      <div className="pricing-inner">
        <div className="pricing-header reveal">
          <span className="section-eyebrow">{data.eyebrow}</span>
          <h2 className="section-title" id="pricing-title" dangerouslySetInnerHTML={{ __html: data.titleHtml }}></h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            {data.subtitle}
          </p>
        </div>
        <div className="pricing-grid reveal reveal-delay-1">
          {data.plans.map((plan, idx) => (
            <div key={idx} className={`price-card ${plan.isFeatured ? 'featured' : ''}`} aria-label={`${plan.name} plan`}>
              <div className="price-plan">{plan.planType}</div>
              <div className="price-name">{plan.name}</div>
              <div className="price-amount">{plan.amount}</div>
              <div className="price-per">{plan.per}</div>
              <div className="price-rule"></div>
              <ul className="price-feats" aria-label={`${plan.name} plan features`}>
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="price-feat">{feat}</li>
                ))}
              </ul>
              <button 
                className={`price-cta ${plan.isFeatured ? 'price-cta-accent' : 'price-cta-outline'}`} 
                onClick={() => onPlanSelect(plan.value)} 
                aria-label={`Select ${plan.name} plan`}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
