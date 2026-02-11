"use client";

import Link from "next/link";

import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

type EmptyStateAction =
    | { label: string; href: string; onClick?: never }
    | { label: string; onClick: () => void; href?: never };

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: EmptyStateAction;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn("flex flex-col items-center justify-center py-8 text-center", className)}
        >
            {Icon && (
                <div className="rounded-full bg-muted p-3 mb-3">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
            )}
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {description && <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>}
            {action && action.href && (
                <Button asChild variant="link" size="sm" className="mt-2">
                    <Link href={action.href}>{action.label}</Link>
                </Button>
            )}
            {action && action.onClick && (
                <Button variant="link" size="sm" className="mt-2" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
