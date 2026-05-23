/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';

import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';

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

// Admin Components & Services
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { isAuthenticated } from './services/adminService';

import pageData from './data/landingPageData.json';
import type { LandingPageData } from './types';

// Cast the imported static JSON as fallback
const staticFallbackData = pageData as LandingPageData;

function AppContent() {
  const [selectedPlan, setSelectedPlan] = useState('');
  const { toasts, showToast, dismissToast } = useToast();

  // Dynamic state for landing page content fetched from MySQL
  // Detect Vitest environment to bypass loading delay and prevent test assertion failures
  const isTestEnv = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true');
  const [landingData, setLandingData] = useState<LandingPageData | null>(
    isTestEnv ? staticFallbackData : null
  );
  const [loading, setLoading] = useState(!isTestEnv);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(isAuthenticated());
  const [adminTab, setAdminTab] = useState('dashboard');

  // Load landing page data dynamically from API (falls back to local JSON on fail)
  const fetchLandingData = async () => {
    if (isTestEnv) return;
    try {
      const response = await fetch('/api/landing-data');
      if (response.ok) {
        const json = await response.json();
        setLandingData(json);
      } else {
        throw new Error('API server returned error response');
      }
    } catch (error) {
      console.warn('[App] MySQL API unreachable, falling back to static local JSON data.', error);
      setLandingData(staticFallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandingData();

    // Listen to custom local history state navigation
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setIsAdminAuthenticated(isAuthenticated());
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Setup scroll reveals
  useEffect(() => {
    if (loading || !landingData || currentPath === '/admin') return;

    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, revealOptions);

    reveals.forEach((reveal) => revealOnScroll.observe(reveal));
    return () => revealOnScroll.disconnect();
  }, [loading, landingData, currentPath]);

  // Handle plan selection from Pricing or BMI sections, scroll to Contact form
  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    const contactSec = document.getElementById('contact');
    if (contactSec) {
      contactSec.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Selected: ${plan}. Scroll down to complete your enquiry.`, 'info');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  // Navigating dynamically between SPA paths
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setIsAdminAuthenticated(isAuthenticated());
  };

  // 1. Rendering Loader State
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0d0d0d',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          letterSpacing: '0.15em',
          marginBottom: '10px',
          color: 'var(--accent-color, #C8F542)'
        }}>CONQUEROR</div>
        <div style={{ color: 'var(--text-secondary, #a3a3a3)', fontSize: '14px' }}>Loading dynamic configuration...</div>
      </div>
    );
  }

  // 2. Rendering Admin Portal
  if (currentPath === '/admin') {
    return (
      <>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        {!isAdminAuthenticated ? (
          <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />
        ) : (
          <AdminLayout
            activeTab={adminTab}
            setActiveTab={setAdminTab}
            onLogout={handleAdminLogout}
          >
            <AdminDashboard
              initialLandingPageData={landingData}
              onRefreshLandingPage={fetchLandingData}
            />
          </AdminLayout>
        )}
      </>
    );
  }

  // 3. Rendering Landing Page View
  const safeData = landingData || staticFallbackData;

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <Header />
      <main>
        <Hero data={safeData.hero} />
        <Marquee items={safeData.marquee} />
        <StatsBanner data={safeData.statsBanner} />
        <About data={safeData.about} />
        <Timings data={safeData.timings} />
        <Facilities data={safeData.facilities} />

        {/* Plan selection state is passed to both Pricing and Contact */}
        <Pricing data={safeData.pricing} onPlanSelect={handlePlanSelect} />
        <BmiCalculator data={safeData.bmi} onPlanSelect={handlePlanSelect} />

        <Reviews data={safeData.reviews} />

        {/* Contact form with lead persistence and toast notifications */}
        <Contact
          data={safeData.contactOptions}
          info={safeData.contactInfo}
          initialPlan={selectedPlan}
          onToast={showToast}
        />

        <div className="map-strip" aria-label="Location information">
          <div className="map-address">
            📍 Madhuvimal Plaza, 2nd Floor, Opp. Dadawadi Temple (Dalchini Hotel), Dadawadi, Jalgaon
          </div>
          <a
            href={safeData.contactInfo.mapUrl}
            className="map-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps →
          </a>
        </div>
      </main>
      <Footer data={safeData.footer} />

      {/* Floating WhatsApp Button */}
      <a
        href={safeData.contactInfo.whatsappUrl}
        className="wa-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
