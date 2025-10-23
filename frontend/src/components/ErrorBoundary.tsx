import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-destructive mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              There was an error rendering this page. Please try refreshing.
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer mb-2">Error details</summary>
              <pre className="whitespace-pre-wrap bg-secondary p-2 rounded text-xs">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
