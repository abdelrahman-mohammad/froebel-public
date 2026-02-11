import type { LucideIcon } from "lucide-react";

import type { ButtonProps } from "@/components/ui/button";

// ============================================================================
// Variant Types
// ============================================================================

export type QuizCardVariant = "explore" | "library" | "featured";
export type QuizCardSize = "compact" | "default" | "large";
export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuizStatus = "draft" | "published" | "archived";

// ============================================================================
// Data Types
// ============================================================================

export interface QuizCardData {
    id: string;
    shareableId?: string;
    title: string;
    description?: string;
    bannerUrl?: string;
    iconUrl?: string;
    questionCount: number;
    timeLimit?: number;
    categoryName?: string;
    creatorName?: string;
    tags?: string[];
    difficulty?: QuizDifficulty;
    totalPoints?: number;
    status?: QuizStatus;
}

export interface QuizCardAction {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: ButtonProps["variant"];
    icon?: LucideIcon;
    iconOnly?: boolean;
}

// ============================================================================
// Component Props
// ============================================================================

export interface QuizCardProps {
    quiz: QuizCardData;
    variant?: QuizCardVariant;
    size?: QuizCardSize;
    showTags?: boolean;
    actions?: QuizCardAction[];
    className?: string;
}

export interface QuizCardSkeletonProps {
    variant?: QuizCardVariant;
    size?: QuizCardSize;
    className?: string;
}
