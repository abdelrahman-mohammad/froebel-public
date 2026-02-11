"use client";

import * as React from "react";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressVariants = cva(
    // Quiz Replay: Progress bar - 12px height, 6px radius
    "relative h-3 w-full overflow-hidden rounded-md",
    {
        variants: {
            variant: {
                default: "bg-border-light",
                success: "bg-success/20",
                warning: "bg-warning/20",
                danger: "bg-destructive/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const indicatorVariants = cva("h-full rounded-md transition-all duration-500", {
    variants: {
        variant: {
            default: "bg-primary",
            success: "bg-success",
            warning: "bg-warning",
            danger: "bg-destructive",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface ProgressProps
    extends
        React.ComponentProps<typeof ProgressPrimitive.Root>,
        VariantProps<typeof progressVariants> {}

function Progress({ className, value, variant, ...props }: ProgressProps) {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn(progressVariants({ variant }), className)}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn(indicatorVariants({ variant }))}
                style={{ width: `${value || 0}%` }}
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress, progressVariants };
