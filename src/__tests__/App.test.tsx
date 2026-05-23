import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });

  it('renders the Header with navigation', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
  });

  it('renders the Hero section', () => {
    render(<App />);
    expect(screen.getByLabelText('Hero')).toBeInTheDocument();
    expect(screen.getByText('RISE.')).toBeInTheDocument();
    expect(screen.getByText('CONQUER.')).toBeInTheDocument();
    expect(screen.getByText('TRANSFORM.')).toBeInTheDocument();
  });

  it('renders the Stats Banner', () => {
    render(<App />);
    expect(screen.getByLabelText('Key statistics')).toBeInTheDocument();
  });

  it('renders the BMI Calculator section', () => {
    render(<App />);
    expect(screen.getByLabelText('BMI Calculator')).toBeInTheDocument();
  });

  it('renders the Contact section with form', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /submit enquiry/i })).toBeInTheDocument();
  });

  it('renders the Footer', () => {
    render(<App />);
    expect(screen.getByLabelText('Site footer')).toBeInTheDocument();
  });

  it('renders the WhatsApp floating button', () => {
    render(<App />);
    const buttons = screen.getAllByLabelText('Chat with us on WhatsApp');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the map strip with address', () => {
    render(<App />);
    expect(screen.getByLabelText('Location information')).toBeInTheDocument();
    const matches = screen.getAllByText(/madhuvimal plaza/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders Google Maps link', () => {
    render(<App />);
    expect(screen.getByText(/open in google maps/i)).toBeInTheDocument();
  });

  it('renders navigation links for all sections', () => {
    render(<App />);
    const nav = screen.getByLabelText('Main navigation');
    expect(nav).toBeInTheDocument();

    // Check key navigation items exist
    const navLinks = screen.getAllByText('About');
    expect(navLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the Start Free Trial CTA', () => {
    render(<App />);
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
  });
});
