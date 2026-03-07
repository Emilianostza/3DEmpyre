import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional custom fallback UI */
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="min-h-[400px] flex flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-950/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" aria-hidden="true" />
          </div>

          <div className="max-w-sm">
            <h2 className="text-lg font-bold text-white mb-1">Something went wrong</h2>
            <p className="text-sm text-zinc-400">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
          </div>

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white text-zinc-900 hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-700 focus:outline-none"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
