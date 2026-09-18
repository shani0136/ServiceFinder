import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '600px',
          margin: '60px auto',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid #fee2e2'
        }}>
          <h2 style={{ color: '#e11d48', marginTop: 0 }}>Application Error</h2>
          <p style={{ color: '#4b5563', lineHeight: 1.6 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <pre style={{
            background: '#f8fafc',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '12px',
            overflowX: 'auto',
            color: '#334155'
          }}>
            {this.state.error?.stack}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '10px 24px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);

