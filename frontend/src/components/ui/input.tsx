import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
    // Quiz Replay: Base input styles
    [
        "w-full min-w-0 bg-background text-foreground",
        "border border-border-light rounded-lg",
        "placeholder:text-muted-foreground",
        "transition-all duration-200 outline-none",
        "hover:border-border",
        "focus:border-primary focus:shadow-[0_0_0_4px_rgba(3,116,181,0.1)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:bg-destructive/5 aria-invalid:border-destructive aria-invalid:focus:!border-destructive aria-invalid:focus:!shadow-[0_0_0_4px_rgba(217,48,37,0.1)]",
        // File input styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
    ],
    {
        variants: {
            size: {
                default: "h-10 px-3.5 py-2.5 text-sm",
                sm: "h-9 px-3 py-2 text-sm",
                lg: "h-12 px-4 py-3.5 text-base",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

interface InputProps
    extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}

function Input({ className, type, size, ...props }: InputProps) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(inputVariants({ size }), className)}
            {...props}
        />
    );
}

export { Input, inputVariants };
