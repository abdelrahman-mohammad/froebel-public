import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ShowcaseItemProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function ShowcaseItem({ title, description, children, className }: ShowcaseItemProps) {
    const id = title.toLowerCase().replace(/\s+/g, "-");

    return (
        <div id={id} className="space-y-4 scroll-mt-8">
            <div>
                <h3 className="text-lg font-medium text-foreground">{title}</h3>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className={cn("p-6 rounded-lg border border-border bg-card", className)}>
                {children}
            </div>
        </div>
    );
}
