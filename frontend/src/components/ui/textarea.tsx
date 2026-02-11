import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
    // Quiz Replay: Base textarea styles matching input
    [
        "w-full min-w-0 bg-background text-foreground",
        "border border-border-light rounded-lg",
        "placeholder:text-muted-foreground",
        "transition-all duration-200 outline-none resize-vertical",
        "hover:border-border",
        "focus:border-primary focus:shadow-[0_0_0_4px_rgba(3,116,181,0.1)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:bg-destructive/5 aria-invalid:border-destructive aria-invalid:focus:!border-destructive aria-invalid:focus:!shadow-[0_0_0_4px_rgba(217,48,37,0.1)]",
    ],
    {
        variants: {
            size: {
                default: "min-h-[100px] px-3.5 py-3 text-[15px]",
                sm: "min-h-[80px] px-3 py-2 text-sm",
                lg: "min-h-[150px] px-4 py-3.5 text-base",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

interface TextareaProps
    extends React.ComponentProps<"textarea">, VariantProps<typeof textareaVariants> {
    size?: "default" | "sm" | "lg" | null;
}

function Textarea({ className, size, ...props }: TextareaProps) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(textareaVariants({ size }), className)}
            {...props}
        />
    );
}

export { Textarea, textareaVariants };
