import React from 'react';
import { Button } from "@/Core";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border rounded-md bg-red-50 text-red-800 my-4">
          <h3 className="font-bold mb-2">Something went wrong</h3>
          <p className="mb-4 text-sm">{this.state.error?.message || "An error occurred while rendering this component."}</p>
          <Button 
            size="sm" 
            onClick={() => window.location.reload()}
            variant="destructive"
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;





















