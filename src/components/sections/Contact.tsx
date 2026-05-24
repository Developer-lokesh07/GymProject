import React, { useState } from 'react';
import type { ContactData, ContactInfo } from '../../types';
import { submitLead, buildWhatsAppUrl } from '../../services/leadService';

interface ContactProps {
  data: ContactData;
  info: ContactInfo;
  initialPlan?: string;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Contact: React.FC<ContactProps> = ({ data, info, initialPlan = '', onToast }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    plan: initialPlan,
    batch: '',
    goal: '',
    message: '',
    consent: false,
    // Honeypot field — hidden from real users, bots will fill it
    website: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  const [prevInitialPlan, setPrevInitialPlan] = useState(initialPlan);
  if (initialPlan !== prevInitialPlan) {
    setPrevInitialPlan(initialPlan);
    setFormData((prev) => ({ ...prev, plan: initialPlan }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check: if the hidden "website" field is filled, it's a bot
    if (formData.website) {
      // Silently reject — don't alert bots that they were caught
      setSubmitted(true);
      return;
    }

    // Validation
    if (!formData.firstName.trim()) {
      if (onToast) {
        onToast('Please enter your first name.', 'error');
      } else {
        alert('Please enter your first name.');
      }
      return;
    }
    if (!formData.phone.trim()) {
      if (onToast) {
        onToast('Please enter your WhatsApp number.', 'error');
      } else {
        alert('Please enter your WhatsApp number.');
      }
      return;
    }
    if (formData.phone.replace(/\D/g, '').length < 8) {
      if (onToast) {
        onToast('Please enter a valid phone number (minimum 8 digits).', 'error');
      } else {
        alert('Please enter a valid phone number (minimum 8 digits).');
      }
      return;
    }
    if (!formData.consent) {
      if (onToast) {
        onToast('Please agree to be contacted to proceed.', 'error');
      } else {
        alert('Please agree to be contacted to proceed.');
      }
      return;
    }

    setSubmitting(true);

    try {
      // Persist lead to localStorage (and future backend) BEFORE WhatsApp redirect
      const lead = await submitLead({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        plan: formData.plan,
        batch: formData.batch,
        goal: formData.goal,
        message: formData.message.trim(),
      });

      const url = buildWhatsAppUrl(lead, info.whatsappUrl);
      setWaUrl(url);
      setSubmitted(true);
      onToast?.('Enquiry saved successfully! Your details are safe with us.', 'success');
    } catch {
      onToast?.(
        "Something went wrong. Your enquiry was saved locally — we won't lose it.",
        'error',
      );
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" aria-labelledby="contact-title">
      <div className="contact-info reveal">
        <span className="section-eyebrow">{data.eyebrow}</span>
        <h2
          className="section-title"
          id="contact-title"
          dangerouslySetInnerHTML={{ __html: data.titleHtml }}
        ></h2>
        <div className="section-rule" aria-hidden="true"></div>
        <address style={{ fontStyle: 'normal' }}>
          <div className="cinfo-item">
            <div className="cinfo-icon" aria-hidden="true">
              📍
            </div>
            <div>
              <div className="cinfo-lbl">Address</div>
              <div
                className="cinfo-val"
                dangerouslySetInnerHTML={{
                  __html: info.address.replace(
                    ' (Dalchini Hotel)',
                    '<br>Opp. Dadawadi Temple (Dalchini Hotel)<br>',
                  ),
                }}
              ></div>
            </div>
          </div>
          <div className="cinfo-item">
            <div className="cinfo-icon" aria-hidden="true">
              📞
            </div>
            <div>
              <div className="cinfo-lbl">Phone</div>
              <div className="cinfo-val">
                <a href={`tel:${info.phone.replace(/\s+/g, '')}`}>{info.phone}</a>
              </div>
            </div>
          </div>
          <div className="cinfo-item">
            <div className="cinfo-icon" aria-hidden="true">
              📸
            </div>
            <div>
              <div className="cinfo-lbl">Instagram</div>
              <div className="cinfo-val">
                <a href={info.instagramUrl} target="_blank" rel="noopener noreferrer">
                  {info.instagram}
                </a>
              </div>
            </div>
          </div>
        </address>
        <a
          className="wa-big"
          href={`${info.whatsappUrl}?text=Hi%2C+I+want+to+know+more+about+Conqueror+Fitness+Hub!`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat on WhatsApp
        </a>
      </div>
      <div className="contact-form-wrap reveal reveal-delay-2">
        {!submitted ? (
          <div id="enquiry-form">
            <span className="section-eyebrow">Membership Enquiry</span>
            <h2
              className="section-title"
              style={{ fontSize: 'clamp(32px,3.5vw,44px)', marginBottom: '28px' }}
            >
              Book a Free
              <br />
              <em>Trial Visit.</em>
            </h2>
            <form id="contact-form" noValidate onSubmit={handleSubmit}>
              {/* Honeypot field — invisible to users, catches bots */}
              <div
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  opacity: 0,
                  height: 0,
                  overflow: 'hidden',
                }}
                aria-hidden="true"
              >
                <label htmlFor="cf-website">Website</label>
                <input
                  type="text"
                  id="cf-website"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="f-row">
                <div className="f-group">
                  <label className="f-label" htmlFor="cf-fname">
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="f-input"
                    id="cf-fname"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Rahul"
                    autoComplete="given-name"
                    required
                    aria-required="true"
                  />
                </div>
                <div className="f-group">
                  <label className="f-label" htmlFor="cf-lname">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="f-input"
                    id="cf-lname"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Sharma"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="f-group">
                <label className="f-label" htmlFor="cf-phone">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  className="f-input"
                  id="cf-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                  autoComplete="tel"
                  required
                  aria-required="true"
                  pattern="[0-9+\s\-]{8,15}"
                />
              </div>
              <div className="f-group">
                <label className="f-label" htmlFor="cf-email">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  className="f-input"
                  id="cf-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@email.com"
                  autoComplete="email"
                />
              </div>
              <div className="f-row">
                <div className="f-group">
                  <label className="f-label" htmlFor="cf-plan">
                    Interested Plan
                  </label>
                  <select
                    className="f-select"
                    id="cf-plan"
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    aria-label="Select membership plan"
                  >
                    <option value="">Select a plan</option>
                    {data.formOptions.plans.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="f-group">
                  <label className="f-label" htmlFor="cf-batch">
                    Preferred Batch
                  </label>
                  <select
                    className="f-select"
                    id="cf-batch"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    aria-label="Select preferred batch"
                  >
                    <option value="">Select batch</option>
                    {data.formOptions.batches.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="f-group">
                <label className="f-label" htmlFor="cf-goal">
                  Your Fitness Goal
                </label>
                <select
                  className="f-select"
                  id="cf-goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  aria-label="Select fitness goal"
                >
                  <option value="">Select your goal</option>
                  {data.formOptions.goals.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="f-group">
                <label className="f-label" htmlFor="cf-msg">
                  Message (Optional)
                </label>
                <textarea
                  className="f-input f-textarea"
                  id="cf-msg"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Any questions, health concerns, schedule preferences, or anything you'd like us to know..."
                  rows={3}
                ></textarea>
              </div>
              <div className="f-check">
                <input
                  type="checkbox"
                  id="cf-consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  required
                  aria-required="true"
                />
                <label htmlFor="cf-consent">
                  I agree to be contacted by Conqueror Fitness Hub via phone or WhatsApp about
                  membership and available offers.
                </label>
              </div>
              <button type="submit" className="f-submit" id="form-submit-btn" disabled={submitting}>
                {submitting ? 'Saving your enquiry...' : 'Submit Enquiry'}
              </button>
            </form>
          </div>
        ) : (
          <div className="form-success visible" id="form-success" aria-live="polite">
            <div className="success-circle" aria-hidden="true">
              ✓
            </div>
            <div className="success-title">Enquiry Received!</div>
            <p className="success-body">
              Thank you! Your enquiry has been saved securely. Our team will contact you within 24
              hours to arrange your complimentary trial visit.
            </p>
            {waUrl && (
              <a
                className="success-wa"
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Send enquiry via WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Also Send via WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
