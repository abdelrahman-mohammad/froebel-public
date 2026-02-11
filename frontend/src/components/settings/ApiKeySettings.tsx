"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// This file uses a valid pattern of syncing state from localStorage on mount
import React, { useCallback, useEffect, useState } from "react";

import { AlertTriangle, Check, ExternalLink, Eye, EyeOff, Key, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AIProvider } from "@/lib/ai-grading/types";
import { getStoredApiKey, removeStoredApiKey, setStoredApiKey } from "@/lib/api-keys";
import { cn } from "@/lib/utils";

interface ProviderInfo {
    id: AIProvider;
    name: string;
    docsUrl: string;
    placeholder: string;
}

const PROVIDERS: ProviderInfo[] = [
    {
        id: "gemini",
        name: "Google Gemini",
        docsUrl: "https://ai.google.dev/",
        placeholder: "AIza...",
    },
    {
        id: "deepseek",
        name: "DeepSeek",
        docsUrl: "https://platform.deepseek.com/",
        placeholder: "sk-...",
    },
    {
        id: "claude",
        name: "Anthropic Claude",
        docsUrl: "https://console.anthropic.com/",
        placeholder: "sk-ant-...",
    },
    {
        id: "openai",
        name: "OpenAI",
        docsUrl: "https://platform.openai.com/",
        placeholder: "sk-...",
    },
];

interface KeyState {
    value: string;
    visible: boolean;
    testing: boolean;
    testResult: "success" | "error" | null;
    testMessage: string;
    hasStored: boolean;
}

type KeyStates = Record<AIProvider, KeyState>;

const initialKeyState: KeyState = {
    value: "",
    visible: false,
    testing: false,
    testResult: null,
    testMessage: "",
    hasStored: false,
};

export interface ApiKeySettingsProps {
    /** Callback when keys change */
    onKeysChange?: () => void;
}

export function ApiKeySettings({ onKeysChange }: ApiKeySettingsProps) {
    const [keys, setKeys] = useState<KeyStates>(() => {
        const initial: Partial<KeyStates> = {};
        for (const p of PROVIDERS) {
            initial[p.id] = { ...initialKeyState };
        }
        return initial as KeyStates;
    });

    // Load stored keys on mount
    useEffect(() => {
        const loaded: Partial<KeyStates> = {};
        for (const p of PROVIDERS) {
            const stored = getStoredApiKey(p.id);
            loaded[p.id] = {
                ...initialKeyState,
                value: stored || "",
                hasStored: !!stored,
            };
        }
        setKeys(loaded as KeyStates);
    }, []);

    const updateKey = useCallback((provider: AIProvider, updates: Partial<KeyState>) => {
        setKeys((prev) => ({
            ...prev,
            [provider]: { ...prev[provider], ...updates },
        }));
    }, []);

    const handleSave = useCallback(
        (provider: AIProvider) => {
            const key = keys[provider].value.trim();
            if (key) {
                setStoredApiKey(provider, key);
                updateKey(provider, { hasStored: true });
                onKeysChange?.();
            }
        },
        [keys, updateKey, onKeysChange]
    );

    const handleClear = useCallback(
        (provider: AIProvider) => {
            removeStoredApiKey(provider);
            updateKey(provider, {
                value: "",
                hasStored: false,
                testResult: null,
                testMessage: "",
            });
            onKeysChange?.();
        },
        [updateKey, onKeysChange]
    );

    const handleTest = useCallback(
        async (provider: AIProvider) => {
            const key = keys[provider].value.trim();
            if (!key) return;

            updateKey(provider, {
                testing: true,
                testResult: null,
                testMessage: "",
            });

            try {
                const response = await fetch("/api/ai/test-key", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ provider, apiKey: key }),
                });

                const data = await response.json();

                if (data.success) {
                    updateKey(provider, {
                        testing: false,
                        testResult: "success",
                        testMessage: "API key is valid!",
                    });
                } else {
                    updateKey(provider, {
                        testing: false,
                        testResult: "error",
                        testMessage: data.error || "Invalid API key",
                    });
                }
            } catch (error) {
                updateKey(provider, {
                    testing: false,
                    testResult: "error",
                    testMessage: error instanceof Error ? error.message : "Test failed",
                });
            }
        },
        [keys, updateKey]
    );

    return (
        <div className="api-key-settings space-y-6">
            <div className="settings-header">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    AI Provider API Keys
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Enter your API keys to enable AI grading for free-text questions. Keys are
                    stored locally in your browser.
                </p>
            </div>

            <div className="security-warning flex items-start gap-2 p-3 rounded-md bg-warning/10 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <span>
                    API keys are stored in your browser&apos;s local storage. Anyone with access to
                    this browser can view them. For production use, consider server-side key
                    management.
                </span>
            </div>

            <div className="providers-list space-y-4">
                {PROVIDERS.map((provider) => {
                    const state = keys[provider.id];
                    const hasValue = state.value.trim().length > 0;

                    return (
                        <div
                            key={provider.id}
                            className="provider-card p-4 rounded-lg border bg-card"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <Label className="text-base font-medium">{provider.name}</Label>
                                <a
                                    href={provider.docsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                >
                                    Get API key
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={state.visible ? "text" : "password"}
                                        value={state.value}
                                        onChange={(e) =>
                                            updateKey(provider.id, {
                                                value: e.target.value,
                                                testResult: null,
                                                testMessage: "",
                                            })
                                        }
                                        placeholder={provider.placeholder}
                                        className={cn(
                                            "pr-10",
                                            state.testResult === "success" && "border-success",
                                            state.testResult === "error" && "border-destructive"
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="absolute right-1 top-1/2 -translate-y-1/2"
                                        onClick={() =>
                                            updateKey(provider.id, {
                                                visible: !state.visible,
                                            })
                                        }
                                    >
                                        {state.visible ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleTest(provider.id)}
                                    disabled={!hasValue || state.testing}
                                >
                                    {state.testing ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Test"
                                    )}
                                </Button>

                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleSave(provider.id)}
                                    disabled={!hasValue}
                                >
                                    Save
                                </Button>

                                {state.hasStored && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleClear(provider.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {/* Test Result */}
                            {state.testResult && (
                                <div
                                    className={cn(
                                        "flex items-center gap-2 mt-2 text-sm",
                                        state.testResult === "success" && "text-success",
                                        state.testResult === "error" && "text-destructive"
                                    )}
                                >
                                    {state.testResult === "success" ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                    {state.testMessage}
                                </div>
                            )}

                            {/* Stored indicator */}
                            {state.hasStored && !state.testResult && (
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 text-success" />
                                    API key saved
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ApiKeySettings;
