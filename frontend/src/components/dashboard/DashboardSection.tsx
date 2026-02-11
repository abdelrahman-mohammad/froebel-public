"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface DashboardSectionProps {
    title: string;
    action?: {
        label: string;
        href: string;
    };
    children: React.ReactNode;
    className?: string;
}

export function DashboardSection({ title, action, children, className }: DashboardSectionProps) {
    return (
        <section className={cn("py-6 border-b last:border-b-0", className)}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                {action && (
                    <Link
                        href={action.href}
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        {action.label}
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}
