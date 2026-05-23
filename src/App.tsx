import { useEffect, useState } from 'react';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { Marquee } from './components/sections/Marquee';
import { StatsBanner } from './components/sections/StatsBanner';
import { About } from './components/sections/About';
import { Facilities } from './components/sections/Facilities';
import { Timings } from './components/sections/Timings';
import { Pricing } from './components/sections/Pricing';
import { Reviews } from './components/sections/Reviews';
import { Contact } from './components/sections/Contact';
import { BmiCalculator } from './components/BmiCalculator';

import pageData from './data/landingPageData.json';
import type { LandingPageData } from './types';

// Cast the imported JSON to our strongly typed interface
const data = pageData as LandingPageData;

function App() {
  const [selectedPlan, setSelectedPlan] = useState('');

  // Handle plan selection from Pricing or BMI sections, scroll to Contact form
  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Setup scroll reveals
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, revealOptions);

    reveals.forEach(reveal => revealOnScroll.observe(reveal));
    return () => revealOnScroll.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero data={data.hero} />
        <Marquee items={data.marquee} />
        <StatsBanner data={data.statsBanner} />
        <About data={data.about} />
        <Timings data={data.timings} />
        <Facilities data={data.facilities} />
        
        {/* We pass the handlePlanSelect down to components that need to trigger the plan selection state */}
        <Pricing data={data.pricing} onPlanSelect={handlePlanSelect} />
        <BmiCalculator data={data.bmi} onPlanSelect={handlePlanSelect} />
        
        <Reviews data={data.reviews} />
        
        {/* Contact form consumes the selectedPlan state dynamically */}
        <Contact data={data.contactOptions} info={data.contactInfo} initialPlan={selectedPlan} />

        <div className="map-strip" aria-label="Location information">
          <div className="map-address">
            📍 Madhuvimal Plaza, 2nd Floor, Opp. Dadawadi Temple (Dalchini Hotel), Dadawadi, Jalgaon
          </div>
          <a href={data.contactInfo.mapUrl} className="map-link" target="_blank" rel="noopener noreferrer">
            Open in Google Maps →
          </a>
        </div>
      </main>
      <Footer data={data.footer} />

      {/* Floating WhatsApp Button */}
      <a href={data.contactInfo.whatsappUrl} className="wa-float" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
        <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
    </>
  );
}

export default App;
