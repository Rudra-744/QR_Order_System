import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-[var(--color-cream,#ece4d8)] flex items-center justify-center p-6 font-sans">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
              <FiAlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-navy,#1a2b4c)] mb-3">Something went wrong</h1>
            <p className="text-gray-500 mb-6">We encountered an unexpected error while rendering this page.</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[var(--color-navy,#1a2b4c)] text-[var(--color-cream,#ece4d8)] font-semibold py-3 rounded-xl transition-transform active:scale-95"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
