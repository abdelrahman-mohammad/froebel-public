"use client";

import * as React from "react";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            className={cn("flex flex-col gap-5", className)}
            {...props}
        />
    );
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={cn(
                // Quiz Replay: Tabs list with bottom border
                "inline-flex items-center gap-2 pb-3 border-b-2 border-border-light",
                className
            )}
            {...props}
        />
    );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                // Quiz Replay: Tab trigger styling
                "inline-flex flex-1 items-center justify-center gap-2",
                "px-4 py-2.5 text-sm font-semibold rounded-lg",
                "border border-border-light bg-background text-muted-foreground",
                "transition-all duration-200 cursor-pointer",
                // Hover state
                "hover:text-primary hover:bg-primary-light",
                // Active state
                "data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:bg-primary-light",
                // Focus state
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
                // Disabled state
                "disabled:pointer-events-none disabled:opacity-50",
                // Icon sizing
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        />
    );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn(
                "flex-1 outline-none",
                // Animation
                "data-[state=active]:animate-fade-in",
                className
            )}
            {...props}
        />
    );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
