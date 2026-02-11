"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError, FormGroup, FormHint } from "@/components/ui/form-group";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/contexts/AuthContext";

import { getErrorMessage } from "@/lib/auth/api";
import {
    PASSWORD_REQUIREMENTS,
    type RegisterFormData,
    registerSchema,
} from "@/lib/auth/validation";

// Social login icons (same as login page)
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );
}

function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

function MicrosoftIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path
                d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
                fill="#00A4EF"
            />
        </svg>
    );
}

// Password strength indicator
function PasswordRequirements({ password }: { password: string }) {
    const checks = [
        { label: "At least 8 characters", test: password.length >= 8 },
        { label: "Uppercase letter", test: /[A-Z]/.test(password) },
        { label: "Lowercase letter", test: /[a-z]/.test(password) },
        { label: "Number", test: /[0-9]/.test(password) },
    ];

    if (!password) {
        return <FormHint>{PASSWORD_REQUIREMENTS.join(" • ")}</FormHint>;
    }

    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            {checks.map((check) => (
                <div
                    key={check.label}
                    className={`flex items-center gap-2 text-xs transition-colors ${check.test ? "text-success" : "text-muted-foreground"}`}
                >
                    {check.test ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>{check.label}</span>
                </div>
            ))}
        </div>
    );
}

// Simple email validation regex
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function RegisterPage() {
    const router = useRouter();
    const {
        register: registerUser,
        loginWithOAuth,
        isLoading,
        isAuthenticated,
        isInitialized,
    } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [oauthLoading, setOauthLoading] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            displayName: "",
        },
    });

    const email = watch("email");
    const password = watch("password");
    const showPasswordField = isValidEmail(email);

    // Redirect authenticated users to home
    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            router.replace("/");
        }
    }, [isInitialized, isAuthenticated, router]);

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data);
            toast.success("Please check your email to verify your account", {
                description: "A verification link has been sent to your email address.",
                duration: 6000,
            });
            router.push("/login");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleOAuthLogin = (provider: "google" | "github" | "microsoft") => {
        setOauthLoading(provider);
        loginWithOAuth(provider);
    };

    const loading = isLoading || isSubmitting;

    // Don't show register form while checking auth or if already authenticated
    if (!isInitialized || isAuthenticated) {
        return null;
    }

    return (
        <AuthSplitLayout>
            <Card className="backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>Get started with Froebel</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Registration Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <FormGroup label="Display Name" htmlFor="displayName" required>
                                <Input
                                    id="displayName"
                                    type="text"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                    aria-invalid={!!errors.displayName}
                                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    {...register("displayName")}
                                />
                                {errors.displayName && (
                                    <FormError>{errors.displayName.message}</FormError>
                                )}
                            </FormGroup>

                            <FormGroup label="Email" htmlFor="email" required>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    {...register("email")}
                                />
                                {errors.email && <FormError>{errors.email.message}</FormError>}
                            </FormGroup>

                            {/* Password field - shown after valid email */}
                            <div
                                className={`grid transition-all duration-300 ease-out ${showPasswordField ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                            >
                                <div className="overflow-hidden">
                                    <FormGroup label="Password" htmlFor="password" required>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                autoComplete="new-password"
                                                aria-invalid={!!errors.password}
                                                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                {...register("password")}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <PasswordRequirements password={password || ""} />
                                        {errors.password && (
                                            <FormError>{errors.password.message}</FormError>
                                        )}
                                    </FormGroup>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
                                size="lg"
                                disabled={loading || !showPasswordField}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    or continue with
                                </span>
                            </div>
                        </div>

                        {/* Social Login Buttons - 2x2 Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOAuthLogin("google")}
                                disabled={loading || oauthLoading !== null}
                                className="h-11 gap-2 transition-all duration-200 hover:bg-muted/80 hover:border-primary/50"
                            >
                                {oauthLoading === "google" ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <GoogleIcon className="h-5 w-5" />
                                )}
                                <span>Google</span>
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOAuthLogin("github")}
                                disabled={loading || oauthLoading !== null}
                                className="h-11 gap-2 transition-all duration-200 hover:bg-muted/80 hover:border-primary/50"
                            >
                                {oauthLoading === "github" ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <GitHubIcon className="h-5 w-5" />
                                )}
                                <span>GitHub</span>
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOAuthLogin("microsoft")}
                                disabled={loading || oauthLoading !== null}
                                className="col-span-2 h-11 gap-2 transition-all duration-200 hover:bg-muted/80 hover:border-primary/50"
                            >
                                {oauthLoading === "microsoft" ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <MicrosoftIcon className="h-5 w-5" />
                                )}
                                <span>Microsoft</span>
                            </Button>
                        </div>

                        {/* Link to Login */}
                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="text-primary hover:underline font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
        </AuthSplitLayout>
    );
}
