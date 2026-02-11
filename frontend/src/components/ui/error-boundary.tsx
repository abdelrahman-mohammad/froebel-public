"use client";

import { Component, type ReactNode } from "react";

import { AlertTriangle } from "lucide-react";

import { Button } from "./button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
    resetLabel?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component to catch and handle errors in child components.
 * Use this to wrap sections that might throw errors to prevent the entire app from crashing.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                            <p className="text-sm font-medium text-destructive">
                                Something went wrong
                            </p>
                            <p className="text-xs text-muted-foreground">
                                An error occurred while rendering this component.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={this.handleReset}
                            >
                                {this.props.resetLabel ?? "Try Again"}
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
