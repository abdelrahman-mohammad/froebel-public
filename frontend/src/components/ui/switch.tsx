"use client";

import * as React from "react";

import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            className={cn(
                // Track - minimal outlined style
                "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full",
                "border border-border bg-transparent cursor-pointer",
                "transition-all duration-200",
                // Hover: slightly darker border
                "hover:border-muted-foreground/50",
                // Checked: filled background with darker border
                "data-[state=checked]:bg-foreground data-[state=checked]:border-foreground",
                // Focus glow
                "focus-visible:shadow-[0_0_0_4px_rgba(3,116,181,0.1)]",
                // Disabled state
                "disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    // Thumb - clean circle
                    "pointer-events-none block h-4 w-4 rounded-full",
                    "shadow-sm transition-all duration-200",
                    // Unchecked: muted thumb
                    "data-[state=unchecked]:translate-x-1 data-[state=unchecked]:bg-muted-foreground",
                    // Checked: white thumb on dark track
                    "data-[state=checked]:translate-x-[22px] data-[state=checked]:bg-background"
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
