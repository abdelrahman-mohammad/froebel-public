"use client";

import React, { Component, ReactNode } from "react";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QuizErrorBoundaryProps {
    children: ReactNode;
    /** Fallback UI to render on error (optional, uses default if not provided) */
    fallback?: ReactNode;
    /** Callback when error occurs */
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    /** Callback when user clicks retry */
    onRetry?: () => void;
}

interface QuizErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary for the Quiz Player
 * Catches rendering errors and displays a recovery UI
 */
export class QuizErrorBoundary extends Component<QuizErrorBoundaryProps, QuizErrorBoundaryState> {
    constructor(props: QuizErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): QuizErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log error to console in development
        console.error("Quiz Player Error:", error);
        console.error("Component Stack:", errorInfo.componentStack);

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        An error occurred while loading the quiz. Your answers have been saved.
                        Please try again.
                    </p>
                    <div className="flex gap-3">
                        <Button onClick={this.handleRetry} variant="default">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </Button>
                    </div>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <details className="mt-6 text-left w-full max-w-lg">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                Error Details (Development Only)
                            </summary>
                            <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-48">
                                {this.state.error.message}
                                {"\n\n"}
                                {this.state.error.stack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default QuizErrorBoundary;
