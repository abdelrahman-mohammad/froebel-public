"use client";

import { createContext, useContext } from "react";

export type EditorSize = "sm" | "default" | "lg";

export interface EditorSizeConfig {
    size: EditorSize;
    // Toolbar styles
    toolbarPadding: string;
    toolbarGap: string;
    separatorHeight: string;
    // Icon sizes
    iconSize: string;
    iconClass: string;
    // Button sizes
    buttonSize: string;
    buttonClass: string;
    // Content area
    contentMinHeight: string;
    contentPadding: string;
    placeholderPadding: string;
    // Font sizes
    fontSize: string;
    // Actions bar
    actionsBarPadding: string;
}

const sizeConfigs: Record<EditorSize, EditorSizeConfig> = {
    sm: {
        size: "sm",
        toolbarPadding: "p-0.5",
        toolbarGap: "gap-1",
        separatorHeight: "!h-5",
        iconSize: "3",
        iconClass: "size-3",
        buttonSize: "h-6 w-6",
        buttonClass: "h-6 w-6 p-0",
        contentMinHeight: "min-h-24",
        contentPadding: "pl-8 pr-3 py-2",
        placeholderPadding: "pl-8 pr-3 pt-[11px] pb-2",
        fontSize: "text-sm",
        actionsBarPadding: "p-0.5",
    },
    default: {
        size: "default",
        toolbarPadding: "p-1",
        toolbarGap: "gap-2",
        separatorHeight: "!h-7",
        iconSize: "4",
        iconClass: "size-4",
        buttonSize: "h-8 w-8",
        buttonClass: "h-8 w-8 p-0",
        contentMinHeight: "min-h-72",
        contentPadding: "px-8 py-4",
        placeholderPadding: "px-8 pt-[18px] pb-4",
        fontSize: "text-base",
        actionsBarPadding: "p-1",
    },
    lg: {
        size: "lg",
        toolbarPadding: "p-1.5",
        toolbarGap: "gap-3",
        separatorHeight: "!h-9",
        iconSize: "5",
        iconClass: "size-5",
        buttonSize: "h-10 w-10",
        buttonClass: "h-10 w-10 p-0",
        contentMinHeight: "min-h-96",
        contentPadding: "px-10 py-6",
        placeholderPadding: "px-10 pt-[27px] pb-6",
        fontSize: "text-lg",
        actionsBarPadding: "p-1.5",
    },
};

const Context = createContext<EditorSizeConfig>(sizeConfigs.default);

export interface EditorSizeProviderProps {
    /** Predefined size preset */
    size?: EditorSize;
    /** Custom config overrides (merged with base size config) */
    customConfig?: Partial<Omit<EditorSizeConfig, "size">>;
    children: React.ReactNode;
}

export function EditorSizeProvider({
    size = "default",
    customConfig,
    children,
}: EditorSizeProviderProps) {
    const baseConfig = sizeConfigs[size];
    const mergedConfig: EditorSizeConfig = customConfig
        ? { ...baseConfig, ...customConfig, size: baseConfig.size }
        : baseConfig;

    return <Context.Provider value={mergedConfig}>{children}</Context.Provider>;
}

export function useEditorSize() {
    return useContext(Context);
}

export function getEditorSizeConfig(size: EditorSize): EditorSizeConfig {
    return sizeConfigs[size];
}
