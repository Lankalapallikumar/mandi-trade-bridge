'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-8xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">
              Something went wrong
            </h2>
            <p className="text-neutral-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn-secondary w-full"
              >
                🔙 Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple error display component
export function ErrorDisplay({ 
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  showRefresh = true
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRefresh?: boolean;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">❌</div>
      <h3 className="text-xl font-bold text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">{message}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            🔄 Try Again
          </button>
        )}
        {showRefresh && (
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary"
          >
            🔄 Refresh Page
          </button>
        )}
      </div>
    </div>
  );
}