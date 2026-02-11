"use client";

import Image from "next/image";
import Link from "next/link";

import { cva } from "class-variance-authority";
import { Clock, Edit, HelpCircle, Play, Target } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type {
    QuizCardAction,
    QuizCardProps,
    QuizCardSize,
    QuizDifficulty,
} from "./types";

// ============================================================================
// Variant Definitions
// ============================================================================

const cardVariants = cva("group transition-all duration-200 flex flex-col h-full overflow-hidden pt-0 pb-3", {
    variants: {
        variant: {
            explore:
                "border-l-4 border-l-primary hover:shadow-lg hover:-translate-y-0.5 hover:border-l-primary/80",
            library: "hover:shadow-md",
            featured:
                "ring-2 ring-primary bg-primary/5 hover:shadow-lg hover:shadow-primary/10",
        },
        size: {
            compact: "gap-2",
            default: "gap-0",
            large: "gap-0",
        },
    },
    defaultVariants: {
        variant: "explore",
        size: "default",
    },
});

const bannerHeightMap: Record<QuizCardSize, string> = {
    compact: "h-0", // Hidden for compact
    default: "h-20",
    large: "h-28",
};

const iconSizeMap: Record<QuizCardSize, string> = {
    compact: "h-8 w-8",
    default: "h-12 w-12",
    large: "h-14 w-14",
};

const iconOverlapMap: Record<QuizCardSize, string> = {
    compact: "mt-0",
    default: "-mt-6",
    large: "-mt-7",
};

const descriptionLinesMap: Record<QuizCardSize, string> = {
    compact: "line-clamp-1",
    default: "line-clamp-2",
    large: "line-clamp-3",
};

const descriptionMinHeightMap: Record<QuizCardSize, string> = {
    compact: "min-h-[1.25rem]",
    default: "min-h-[2.5rem]",
    large: "min-h-[3.75rem]",
};

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(title: string): string {
    return title
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getDifficultyLabel(difficulty?: QuizDifficulty): string {
    if (!difficulty) return "—";
    return capitalize(difficulty);
}

// ============================================================================
// Helper Components
// ============================================================================

function TagList({ tags, max = 3, className }: { tags: string[]; max?: number; className?: string }) {
    const visibleTags = tags.slice(0, max);
    const remaining = tags.length - max;

    return (
        <div className={cn("flex flex-wrap gap-1", className)}>
            {visibleTags.map((tag) => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className="text-[9px] font-normal px-1.5 py-0 h-4 hover:bg-secondary/80 transition-colors"
                >
                    {tag}
                </Badge>
            ))}
            {remaining > 0 && (
                <Badge variant="outline" className="text-[9px] font-normal px-1.5 py-0 h-4 text-muted-foreground">
                    +{remaining}
                </Badge>
            )}
        </div>
    );
}

function ActionButton({ action, size }: { action: QuizCardAction; size: QuizCardSize }) {
    const { label, href, onClick, variant = "default", icon: Icon, iconOnly } = action;

    const buttonSizeMap = {
        compact: "sm",
        default: "sm",
        large: "default",
    } as const;
    const buttonSize = buttonSizeMap[size];
    const isIconButton = iconOnly && Icon;

    const content = (
        <>
            {Icon && <Icon className={cn(isIconButton ? "h-4 w-4" : "h-3.5 w-3.5")} />}
            {!isIconButton && <span>{label}</span>}
        </>
    );

    const resolvedSize = isIconButton ? ("icon" as const) : buttonSize;

    if (href) {
        return (
            <Button asChild variant={variant} size={resolvedSize} className={cn(isIconButton && "shrink-0")}>
                <Link href={href}>{content}</Link>
            </Button>
        );
    }

    return (
        <Button variant={variant} size={resolvedSize} onClick={onClick} className={cn(isIconButton && "shrink-0")}>
            {content}
        </Button>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function QuizCard({
    quiz,
    variant = "explore",
    size = "default",
    showTags = false,
    actions,
    className,
}: QuizCardProps) {
    const {
        title,
        description,
        bannerUrl,
        iconUrl,
        questionCount,
        timeLimit,
        categoryName,
        tags,
        difficulty,
    } = quiz;

    const isCompact = size === "compact";
    const maxTags = size === "large" ? 5 : 3;

    return (
        <Card className={cn(cardVariants({ variant, size }), className)}>
            {/* Banner Section - hidden for compact */}
            {!isCompact && (
                <div className={cn("relative overflow-hidden rounded-t-xl", bannerHeightMap[size])}>
                    {/* Banner Image or Gradient Fallback */}
                    {bannerUrl ? (
                        <Image
                            src={bannerUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
                    )}
                    {/* Bottom fade overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent" />
                </div>
            )}

            {/* Header with overlapping icon */}
            <CardHeader
                className={cn(
                    "flex-row items-start gap-3 space-y-0 px-4",
                    !isCompact && iconOverlapMap[size],
                    !isCompact && "relative z-10",
                    isCompact ? "py-3" : "pt-0 pb-2"
                )}
            >
                {/* Icon - overlaps banner */}
                <Avatar
                    className={cn(
                        iconSizeMap[size],
                        "rounded-lg shrink-0",
                        !isCompact && "ring-4 ring-card shadow-sm"
                    )}
                >
                    <AvatarImage src={iconUrl} alt={title} className="object-cover" />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-sm">
                        {getInitials(title)}
                    </AvatarFallback>
                </Avatar>

                {/* Title + Category */}
                <div className="flex-1 min-w-0 space-y-1">
                    <CardTitle
                        className={cn(
                            "line-clamp-2 group-hover:text-primary transition-colors",
                            size === "large" ? "text-lg" : size === "compact" ? "text-sm" : "text-base"
                        )}
                    >
                        {title}
                    </CardTitle>
                    {categoryName && (
                        <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground border-muted-foreground/30"
                        >
                            {categoryName}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className={cn("flex-1 space-y-3 px-4", isCompact ? "pb-2" : "pb-3")}>
                {/* Description - fixed height with truncation */}
                {!isCompact && (
                    <p
                        className={cn(
                            "text-sm text-muted-foreground",
                            descriptionLinesMap[size],
                            descriptionMinHeightMap[size]
                        )}
                    >
                        {description || "No description available"}
                    </p>
                )}

                <Separator />

                {/* Stats Row - ALWAYS visible with fallbacks */}
                <div className={cn(
                    "flex flex-wrap gap-x-4 gap-y-1.5 text-muted-foreground",
                    isCompact ? "text-xs" : "text-sm"
                )}>
                    <div className="flex items-center gap-1.5">
                        <HelpCircle className={cn(isCompact ? "h-3.5 w-3.5" : "h-4 w-4", "shrink-0")} />
                        <span>
                            {questionCount} question{questionCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className={cn(isCompact ? "h-3.5 w-3.5" : "h-4 w-4", "shrink-0")} />
                        <span>{timeLimit ? `${timeLimit} min` : "Unlimited"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Target className={cn(isCompact ? "h-3.5 w-3.5" : "h-4 w-4", "shrink-0")} />
                        <span>{getDifficultyLabel(difficulty)}</span>
                    </div>
                </div>
            </CardContent>

            {/* Footer: Actions + Tags */}
            <CardFooter className="flex-col items-stretch gap-3 px-4 pb-0 pt-0 mt-auto">
                {/* Action buttons */}
                {actions && actions.length > 0 && (
                    <div className="flex gap-2">
                        {actions.map((action, index) => (
                            <ActionButton key={action.label + index} action={action} size={size} />
                        ))}
                    </div>
                )}

                {/* Tags - optional, displayed at very bottom */}
                {showTags && tags && tags.length > 0 && (
                    <TagList tags={tags} max={maxTags} />
                )}
            </CardFooter>
        </Card>
    );
}

// ============================================================================
// Default Action Presets
// ============================================================================

export function getExploreActions(shareableId?: string): QuizCardAction[] {
    if (!shareableId) return [];
    return [
        {
            label: "Take Quiz",
            href: `/quiz/${shareableId}`,
            variant: "default",
        },
    ];
}

export function getLibraryActions(id: string, shareableId?: string): QuizCardAction[] {
    const actions: QuizCardAction[] = [
        {
            label: "Edit",
            href: `/quiz/${id}/edit`,
            variant: "outline",
            icon: Edit,
        },
    ];

    if (shareableId) {
        actions.push({
            label: "Play",
            href: `/quiz/${shareableId}`,
            variant: "default",
            icon: Play,
        });
    }

    return actions;
}

export function getFeaturedActions(shareableId?: string): QuizCardAction[] {
    if (!shareableId) return [];
    return [
        {
            label: "Start Now",
            href: `/quiz/${shareableId}`,
            variant: "default",
        },
    ];
}
