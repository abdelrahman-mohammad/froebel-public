import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const kbdVariants = cva(
    "inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded text-[11px] font-bold [font-family:inherit]",
    {
        variants: {
            variant: {
                // Default: dark keyboard key styling with 3D effect
                default:
                    "bg-secondary text-secondary-foreground border border-border border-b-2 border-b-border-light",
                // Inverted: for use inside dark tooltips
                inverted: "bg-background/20 text-background border border-background/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface KbdProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof kbdVariants> {
    children: React.ReactNode;
}

function Kbd({ className, variant, children, ...props }: KbdProps) {
    return (
        <kbd className={cn(kbdVariants({ variant }), className)} {...props}>
            {children}
        </kbd>
    );
}

export { Kbd, kbdVariants };
