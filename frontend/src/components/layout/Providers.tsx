"use client";

import { ReactNode } from "react";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthErrorBoundary>
                <AuthProvider>{children}</AuthProvider>
            </AuthErrorBoundary>
        </NextThemesProvider>
    );
}

export default Providers;
