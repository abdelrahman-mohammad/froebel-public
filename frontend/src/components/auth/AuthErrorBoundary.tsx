"use client";

import { Component, ErrorInfo, ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class AuthErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("AuthContext error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    handleLogout = () => {
        // Clear any locally stored auth state
        // NOTE: HttpOnly cookies (access_token, refresh_token) cannot be cleared from JavaScript.
        // They will be cleared by the backend when the user logs in again, or expire naturally.
        // This is a security feature - it prevents XSS attacks from stealing auth tokens.
        localStorage.removeItem("auth_user");

        // Redirect to login page. The middleware will handle any remaining cookie issues,
        // and logging in again will refresh the auth state properly.
        window.location.href = "/login";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-background">
                    <div className="mx-auto max-w-md space-y-6 p-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                            <svg
                                className="h-8 w-8 text-destructive"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground">
                            Authentication Error
                        </h2>
                        <p className="text-muted-foreground">
                            Something went wrong with your authentication
                            session. Please try again or log in again.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button onClick={this.handleRetry}>
                                Try Again
                            </Button>
                            <Button
                                variant="outline"
                                onClick={this.handleLogout}
                            >
                                Log In Again
                            </Button>
                        </div>
                        {process.env.NODE_ENV === "development" &&
                            this.state.error && (
                                <details className="mt-4 text-left">
                                    <summary className="cursor-pointer text-sm text-muted-foreground">
                                        Error Details
                                    </summary>
                                    <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                                        {this.state.error.message}
                                        {"\n"}
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

export default AuthErrorBoundary;
