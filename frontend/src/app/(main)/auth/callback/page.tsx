"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { getMe } from "@/lib/auth/api";

type CallbackStatus = "loading" | "success" | "error";

/**
 * OAuth Callback Handler
 *
 * The backend sets HttpOnly cookies for access and refresh tokens,
 * then redirects here with either:
 * - ?success=true (tokens are in cookies)
 * - ?error=<message> (authentication failed)
 */
export default function OAuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState<CallbackStatus>("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        async function handleCallback() {
            // Validate OAuth flow was initiated from our app (CSRF protection)
            const storedProvider = sessionStorage.getItem("oauth_provider");
            const storedTimestamp = sessionStorage.getItem("oauth_timestamp");

            // Clear OAuth state from sessionStorage
            sessionStorage.removeItem("oauth_provider");
            sessionStorage.removeItem("oauth_timestamp");

            // Check if OAuth flow was initiated from our app
            if (!storedProvider) {
                setStatus("error");
                setErrorMessage("Invalid authentication flow. Please try again from the login page.");
                return;
            }

            // Check if OAuth flow is too old (5 minutes max)
            const timestamp = storedTimestamp ? parseInt(storedTimestamp, 10) : 0;
            const maxAge = 5 * 60 * 1000; // 5 minutes
            if (Date.now() - timestamp > maxAge) {
                setStatus("error");
                setErrorMessage("Authentication session expired. Please try again.");
                return;
            }

            // Parse query parameters
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get("error");
            const success = urlParams.get("success");

            // Check for error from OAuth provider
            if (error) {
                setStatus("error");
                setErrorMessage(decodeURIComponent(error));
                return;
            }

            // Verify success indicator
            if (success !== "true") {
                setStatus("error");
                setErrorMessage("Invalid authentication response.");
                return;
            }

            try {
                // Verify authentication by fetching user info
                // This uses the HttpOnly cookies set by the backend
                await getMe();

                setStatus("success");
                toast.success("Welcome!");

                // Clear the URL params for cleaner URL
                window.history.replaceState(null, "", window.location.pathname);

                // Redirect to home after a brief delay
                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } catch (error) {
                setStatus("error");
                setErrorMessage(
                    error instanceof Error ? error.message : "Failed to complete authentication"
                );
            }
        }

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
            <Card className="w-full max-w-md">
                <CardContent className="pt-6">
                    {status === "loading" && (
                        <div className="text-center space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                            <div>
                                <h2 className="text-xl font-semibold">Signing you in...</h2>
                                <p className="text-muted-foreground mt-1">
                                    Please wait while we complete authentication.
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
                            <div>
                                <h2 className="text-xl font-semibold">Success!</h2>
                                <p className="text-muted-foreground mt-1">
                                    Redirecting you to the app...
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="text-center space-y-4">
                            <XCircle className="h-12 w-12 text-destructive mx-auto" />
                            <div>
                                <h2 className="text-xl font-semibold">Authentication Failed</h2>
                                <p className="text-muted-foreground mt-1">{errorMessage}</p>
                            </div>
                            <div className="flex flex-col gap-2 pt-4">
                                <Button onClick={() => router.push("/login")} className="w-full">
                                    Try Again
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push("/")}
                                    className="w-full"
                                >
                                    Go to Home
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
