import React from 'react';
import type { ReviewsData } from '../../types';

interface ReviewsProps {
  data: ReviewsData;
}

export const Reviews: React.FC<ReviewsProps> = ({ data }) => {
  return (
    <section id="reviews" aria-labelledby="reviews-title">
      <div className="reviews-inner">
        <div className="reviews-header reveal">
          <span className="section-eyebrow">{data.eyebrow}</span>
          <h2
            className="section-title"
            id="reviews-title"
            dangerouslySetInnerHTML={{ __html: data.titleHtml }}
          ></h2>
        </div>

        <div
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '56px' }}
          className="reveal reveal-delay-1"
        >
          <div
            className="rating-badge"
            role="img"
            aria-label={`${data.overall.rating} out of 5 stars, ${data.overall.count}`}
          >
            <div className="rating-big">{data.overall.rating}</div>
            <div className="rating-right">
              <div className="rating-stars" aria-hidden="true">
                {data.overall.stars}
              </div>
              <div className="rating-count">{data.overall.count}</div>
            </div>
          </div>
        </div>

        <div className="reviews-grid reveal reveal-delay-2">
          {data.items.map((review, idx) => (
            <article key={idx} className="review-card">
              <div className="review-stars" aria-label="5 out of 5 stars">
                {review.stars}
              </div>
              <blockquote className="review-quote">{review.quote}</blockquote>
              <div className="review-sep" aria-hidden="true"></div>
              <div className="review-author">
                <div className="review-av" aria-hidden="true">
                  {review.authorInitials}
                </div>
                <div>
                  <div className="review-name">{review.authorName}</div>
                  <div className="review-when">{review.date}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
