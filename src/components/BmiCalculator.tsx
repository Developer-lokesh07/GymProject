import React, { useState } from 'react';
import type { BmiData } from '../types';

interface BmiCalculatorProps {
  data: BmiData;
  onPlanSelect: (planValue: string) => void;
}

export const BmiCalculator: React.FC<BmiCalculatorProps> = ({ data, onPlanSelect }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');

  const [result, setResult] = useState<{
    bmi: number;
    cat: string;
    color: string;
    pct: number;
    msg: string;
  } | null>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const hCm = parseFloat(height);
    if (!w || !hCm || w <= 0 || hCm <= 0) {
      alert('Please enter valid weight and height.');
      return;
    }

    const h = hCm / 100;
    const bmi = w / (h * h);

    let cat, color, pct, msg;
    if (bmi < 18.5) {
      cat = 'Underweight';
      color = '#60a5fa';
      pct = 18;
      msg =
        'Your weight is below the healthy range. A structured muscle-building and nutrition program can help you reach your optimal body composition safely.';
    } else if (bmi < 25) {
      cat = 'Healthy Weight ✓';
      color = '#C8F542';
      pct = 55;
      msg =
        "You're in the healthy BMI range. Keep training consistently to maintain and improve your fitness level. Our trainers can help you set new performance goals.";
    } else if (bmi < 30) {
      cat = 'Overweight';
      color = '#F59E0B';
      pct = 74;
      msg =
        'With a structured weight-loss program and the right guidance, you can reach a healthy range. Our certified trainers specialise in effective fat-loss strategies.';
    } else {
      cat = 'High BMI';
      color = '#F87171';
      pct = 90;
      msg =
        'The best time to start is right now. Our trainers build safe, effective plans tailored to your current fitness level — no judgement, just results.';
    }

    setResult({ bmi, cat, color, pct, msg });
  };

  return (
    <section id="bmi" aria-labelledby="bmi-title">
      <div className="container">
        <div className="bmi-inner">
          <div className="reveal">
            <span className="section-eyebrow">{data.eyebrow}</span>
            <h2
              className="section-title"
              id="bmi-title"
              dangerouslySetInnerHTML={{ __html: data.titleHtml }}
            ></h2>
            <div className="section-rule" aria-hidden="true"></div>
            <p className="section-body">{data.description}</p>
          </div>
          <div className="reveal reveal-delay-2">
            <div className="bmi-form" role="form" aria-label="BMI Calculator">
              <div className="f-group">
                <label className="f-label" htmlFor="bmi-weight">
                  Your Weight (kg)
                </label>
                <input
                  type="number"
                  className="f-input"
                  id="bmi-weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 72"
                  min="20"
                  max="300"
                  step="0.1"
                  aria-required="true"
                />
              </div>
              <div className="f-row">
                <div className="f-group">
                  <label className="f-label" htmlFor="bmi-height">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    className="f-input"
                    id="bmi-height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 170"
                    min="100"
                    max="250"
                    aria-required="true"
                  />
                </div>
                <div className="f-group">
                  <label className="f-label" htmlFor="bmi-age">
                    Age
                  </label>
                  <input
                    type="number"
                    className="f-input"
                    id="bmi-age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 24"
                    min="10"
                    max="100"
                  />
                </div>
              </div>
              <button className="bmi-btn" onClick={calculateBMI} type="button">
                Calculate My BMI
              </button>

              <div className={`bmi-result-wrapper ${result ? 'open' : ''}`}>
                <div className="bmi-result" aria-live="polite" aria-label="BMI result">
                  {result && (
                    <div className="bmi-result-inner">
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          marginBottom: '12px',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '10px',
                              letterSpacing: '0.25em',
                              textTransform: 'uppercase',
                              color: 'var(--text-tertiary)',
                              marginBottom: '4px',
                            }}
                          >
                            Your BMI
                          </div>
                          <div className="bmi-val">{result.bmi.toFixed(1)}</div>
                        </div>
                        <div
                          className="bmi-cat"
                          style={{ color: result.color, textAlign: 'right' }}
                        >
                          {result.cat}
                        </div>
                      </div>
                      <div
                        className="bmi-bar"
                        role="progressbar"
                        aria-valuenow={Math.round(result.pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="bmi-bar-fill"
                          style={{ width: `${result.pct}%`, background: result.color }}
                        ></div>
                      </div>
                      <p className="bmi-msg">{result.msg}</p>
                      <button
                        onClick={() => onPlanSelect('Free Trial First')}
                        className="bmi-plan-link"
                      >
                        Get a custom plan →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
