"use client";

import React from "react";

import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, SerializedEditorState } from "lexical";

import { EditorSize, EditorSizeProvider } from "@/components/editor/context/editor-size-context";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";

import { nodes } from "./nodes";
import { Plugins, type PluginsConfig } from "./plugins";

interface EditorErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface EditorErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class EditorErrorBoundary extends React.Component<
    EditorErrorBoundaryProps,
    EditorErrorBoundaryState
> {
    constructor(props: EditorErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): EditorErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[RichTextEditor] Component error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">
                            Editor encountered an error. Please refresh the page.
                        </p>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}

const createEditorConfig = (onError?: (error: Error) => void): InitialConfigType => ({
    namespace: "Editor",
    theme: editorTheme,
    nodes,
    onError: (error: Error) => {
        console.error("[RichTextEditor] Lexical error:", error);
        onError?.(error);
    },
});

export interface EditorProps {
    editorState?: EditorState;
    editorSerializedState?: SerializedEditorState;
    onChange?: (editorState: EditorState) => void;
    onSerializedChange?: (editorSerializedState: SerializedEditorState) => void;
    size?: EditorSize;
    resizable?: boolean;
    /** Maximum character limit (default: 500) */
    maxLength?: number;
    /** Auto-focus the editor on mount */
    autoFocus?: boolean;
    /** Hide specific action buttons */
    hideActions?: PluginsConfig["hideActions"];
    /** Error callback for Lexical errors */
    onError?: (error: Error) => void;
    /** Custom fallback UI when error occurs */
    errorFallback?: React.ReactNode;
}

export function Editor({
    editorState,
    editorSerializedState,
    onChange,
    onSerializedChange,
    size = "default",
    resizable = false,
    maxLength = 500,
    autoFocus = false,
    hideActions,
    onError,
    errorFallback,
}: EditorProps) {
    const editorConfig = createEditorConfig(onError);

    return (
        <EditorErrorBoundary fallback={errorFallback}>
            <div className="bg-background overflow-hidden rounded-lg border shadow">
                <EditorSizeProvider size={size}>
                    <LexicalComposer
                        initialConfig={{
                            ...editorConfig,
                            ...(editorState ? { editorState } : {}),
                            ...(editorSerializedState
                                ? {
                                      editorState: JSON.stringify(editorSerializedState),
                                  }
                                : {}),
                        }}
                    >
                        <TooltipProvider>
                            <Plugins
                                resizable={resizable}
                                maxLength={maxLength}
                                autoFocus={autoFocus}
                                hideActions={hideActions}
                            />

                            <OnChangePlugin
                                ignoreSelectionChange={true}
                                onChange={(editorState) => {
                                    onChange?.(editorState);
                                    onSerializedChange?.(editorState.toJSON());
                                }}
                            />
                        </TooltipProvider>
                    </LexicalComposer>
                </EditorSizeProvider>
            </div>
        </EditorErrorBoundary>
    );
}
