import { Component, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level Error Boundary to prevent full-app crashes.
 * Catches render errors and displays a fallback UI instead of a white screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0D0D0D',
            color: '#F5F5F0',
            fontFamily: "'DM Sans', sans-serif",
            padding: '40px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '2px solid #C8F542',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '24px',
              color: '#C8F542',
            }}
          >
            ⚠
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '48px',
              letterSpacing: '0.04em',
              marginBottom: '12px',
            }}
          >
            Something Went Wrong
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#888882',
              maxWidth: '400px',
              lineHeight: 1.7,
              marginBottom: '32px',
            }}
          >
            We encountered an unexpected error. Please try refreshing the page. If the issue
            persists, contact us on WhatsApp.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '14px 32px',
                background: '#C8F542',
                color: '#0D0D0D',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
            <a
              href="https://wa.me/919370527547"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 32px',
                background: '#25D366',
                color: '#fff',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Contact Us
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
