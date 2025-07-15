import { Button } from '@/Core';
import React from 'react';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="my-4 rounded-md border bg-red-50 p-6 text-red-800">
                    <h3 className="mb-2 font-bold">Something went wrong</h3>
                    <p className="mb-4 text-sm">{this.state.error?.message || 'An error occurred while rendering this component.'}</p>
                    <Button size="sm" onClick={() => window.location.reload()} variant="destructive">
                        Refresh Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
