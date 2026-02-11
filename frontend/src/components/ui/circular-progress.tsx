"use client";

import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const circularProgressVariants = cva("", {
    variants: {
        variant: {
            default: "text-primary",
            success: "text-success",
            warning: "text-warning",
            danger: "text-destructive",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

interface CircularProgressProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof circularProgressVariants> {
    value: number;
    size?: number;
    strokeWidth?: number;
    showValue?: boolean;
    trackClassName?: string;
    children?: React.ReactNode;
}

function CircularProgress({
    value,
    size = 120,
    strokeWidth = 8,
    variant,
    showValue = false,
    trackClassName,
    children,
    className,
    ...props
}: CircularProgressProps) {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value));

    // Calculate SVG properties
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampedValue / 100) * circumference;

    // Center point
    const center = size / 2;

    return (
        <div
            className={cn("relative inline-flex items-center justify-center", className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    className={cn("stroke-muted", trackClassName)}
                />
                {/* Progress arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={cn(
                        "stroke-current transition-[stroke-dashoffset] duration-500 ease-out",
                        circularProgressVariants({ variant })
                    )}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {children ? (
                    children
                ) : showValue ? (
                    <span className="text-2xl font-bold tabular-nums">
                        {Math.round(clampedValue)}%
                    </span>
                ) : null}
            </div>
        </div>
    );
}

export { CircularProgress, circularProgressVariants };
