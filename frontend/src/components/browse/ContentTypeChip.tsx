"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface ContentTypeChipProps {
    icon: React.ReactNode;
    label: string;
    count: number;
    active: boolean;
    onToggle: () => void;
}

export function ContentTypeChip({ icon, label, count, active, onToggle }: ContentTypeChipProps) {
    return (
        <Button
            variant={active ? "default" : "outline"}
            size="sm"
            onClick={onToggle}
            className={cn("gap-2", !active && "text-muted-foreground")}
        >
            {icon}
            {label}
            <span className="text-xs opacity-70">({count})</span>
        </Button>
    );
}
