"use client";

import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";

import * as authApi from "@/lib/auth/api";
import { clearLegacyTokens } from "@/lib/auth/storage";
import type { LoginFormData, RegisterFormData } from "@/lib/auth/validation";

import type { OAuthProvider, User } from "@/types/auth";

// ============================================================================
// Types
// ============================================================================

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
}

type AuthAction =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_USER"; payload: User | null }
    | { type: "LOGOUT" }
    | { type: "INITIALIZE"; payload: { user: User | null } };

interface AuthContextValue {
    // State
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    login: (data: LoginFormData) => Promise<void>;
    register: (data: RegisterFormData) => Promise<void>;
    logout: () => Promise<void>;
    loginWithOAuth: (provider: OAuthProvider) => void;
    refreshAuth: () => Promise<boolean>;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
};

// ============================================================================
// Reducer
// ============================================================================

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, isLoading: action.payload };

        case "SET_USER":
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                isLoading: false,
            };

        case "LOGOUT":
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
            };

        case "INITIALIZE":
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: !!action.payload.user,
                isLoading: false,
                isInitialized: true,
            };

        default:
            return state;
    }
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state on mount
    useEffect(() => {
        async function initializeAuth() {
            // Clean up any legacy localStorage tokens (migration)
            clearLegacyTokens();

            // With HttpOnly cookies, we check auth by calling getMe()
            // If the cookie is valid, we get the user; otherwise 401
            try {
                const user = await authApi.getMe();
                dispatch({ type: "INITIALIZE", payload: { user } });
                return;
            } catch {
                // Not authenticated or token expired, try refresh
            }

            // Try to refresh using refresh token cookie
            try {
                await authApi.refreshToken();
                // Refresh successful, now get user
                const user = await authApi.getMe();
                dispatch({ type: "INITIALIZE", payload: { user } });
                return;
            } catch {
                // Refresh failed - not authenticated
            }

            // No valid auth
            dispatch({ type: "INITIALIZE", payload: { user: null } });
        }

        initializeAuth();
    }, []);

    // Login with email/password
    const login = useCallback(async (data: LoginFormData) => {
        dispatch({ type: "SET_LOADING", payload: true });

        try {
            const response = await authApi.login(data);
            // Tokens are now set via HttpOnly cookies by the backend

            if (response.user) {
                dispatch({ type: "SET_USER", payload: response.user });
            } else {
                // Fetch user if not included in response
                const user = await authApi.getMe();
                dispatch({ type: "SET_USER", payload: user });
            }
        } catch (error) {
            dispatch({ type: "SET_LOADING", payload: false });
            throw error;
        }
    }, []);

    // Register new account - no tokens returned, user must verify email first
    const register = useCallback(async (data: RegisterFormData) => {
        dispatch({ type: "SET_LOADING", payload: true });

        try {
            await authApi.register(data);
            // Registration successful - user needs to verify email before logging in
            // No tokens are returned, so we just reset loading state
            dispatch({ type: "SET_LOADING", payload: false });
        } catch (error) {
            dispatch({ type: "SET_LOADING", payload: false });
            throw error;
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        dispatch({ type: "SET_LOADING", payload: true });

        try {
            await authApi.logout();
            // Backend clears the HttpOnly cookies
        } catch {
            // Ignore errors - we'll clear local state anyway
        } finally {
            clearLegacyTokens();
            dispatch({ type: "LOGOUT" });
        }
    }, []);

    // OAuth login - redirects to provider with CSRF protection
    const loginWithOAuth = useCallback((provider: OAuthProvider) => {
        // Store provider for validation on callback
        sessionStorage.setItem("oauth_provider", provider);
        sessionStorage.setItem("oauth_timestamp", Date.now().toString());

        const url = authApi.getOAuthUrl(provider);
        window.location.href = url;
    }, []);

    // Refresh authentication
    const refreshAuth = useCallback(async (): Promise<boolean> => {
        try {
            await authApi.refreshToken();
            // New tokens set via HttpOnly cookies
            return true;
        } catch {
            dispatch({ type: "LOGOUT" });
            return false;
        }
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: state.user,
            isAuthenticated: state.isAuthenticated,
            isLoading: state.isLoading,
            isInitialized: state.isInitialized,
            login,
            register,
            logout,
            loginWithOAuth,
            refreshAuth,
        }),
        [state.user, state.isAuthenticated, state.isLoading, state.isInitialized, login, register, logout, loginWithOAuth, refreshAuth]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hooks
// ============================================================================

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Optional hook that returns null instead of throwing
export function useAuthSafe(): AuthContextValue | null {
    return useContext(AuthContext);
}
