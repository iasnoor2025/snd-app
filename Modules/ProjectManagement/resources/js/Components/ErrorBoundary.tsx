import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="m-4 border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {t('rental:something_went_wrong')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertDescription>{this.state.error?.message || 'An unexpected error occurred'}</AlertDescription>
                        </Alert>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="text-sm">
                                <summary className="mb-2 cursor-pointer font-medium">Error Details (Development)</summary>
                                <pre className="overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap">
                                    {this.state.error?.stack}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <Button variant="outline" onClick={this.handleReset} className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
