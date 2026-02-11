"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import * as authApi from "@/lib/auth/api";

type VerificationStatus = "verifying" | "success" | "error" | "missing_token";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = useMemo(() => searchParams.get("token"), [searchParams]);
    const [status, setStatus] = useState<VerificationStatus>(
        token ? "verifying" : "missing_token"
    );
    const [errorMessage, setErrorMessage] = useState<string>(
        token ? "" : "No verification token provided."
    );

    useEffect(() => {
        // Clear the token from URL immediately to prevent exposure in browser history
        // or if user shares the URL. The token is already captured in the 'token' variable.
        if (token && typeof window !== "undefined") {
            window.history.replaceState({}, "", "/verify-email");
        }

        if (!token) {
            return;
        }

        const verifyToken = async () => {
            try {
                await authApi.verifyEmail(token);
                setStatus("success");
            } catch (error) {
                setStatus("error");
                setErrorMessage(authApi.getErrorMessage(error));
            }
        };

        verifyToken();
    }, [token]);

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                {status === "verifying" && (
                    <>
                        <div className="mx-auto mb-4">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                        <CardTitle>Verifying your email</CardTitle>
                        <CardDescription>
                            Please wait while we verify your email address...
                        </CardDescription>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="mx-auto mb-4">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                        <CardTitle>Email verified!</CardTitle>
                        <CardDescription>
                            Your email has been successfully verified. You can
                            now log in to your account.
                        </CardDescription>
                    </>
                )}

                {(status === "error" || status === "missing_token") && (
                    <>
                        <div className="mx-auto mb-4">
                            <XCircle className="h-12 w-12 text-destructive" />
                        </div>
                        <CardTitle>Verification failed</CardTitle>
                        <CardDescription>
                            {errorMessage ||
                                "Unable to verify your email address."}
                        </CardDescription>
                    </>
                )}
            </CardHeader>

            <CardContent className="flex justify-center">
                {status === "success" && (
                    <Button onClick={() => router.push("/login")}>
                        Continue to Login
                    </Button>
                )}

                {(status === "error" || status === "missing_token") && (
                    <div className="flex w-full flex-col gap-3">
                        <Button
                            onClick={() => router.push("/login")}
                            className="w-full"
                        >
                            Go to Login
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/register">Create New Account</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function LoadingFallback() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <CardTitle>Loading...</CardTitle>
                <CardDescription>
                    Please wait while we load the verification page...
                </CardDescription>
            </CardHeader>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Suspense fallback={<LoadingFallback />}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
