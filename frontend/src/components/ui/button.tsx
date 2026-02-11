import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    // Base styles - Soft & Friendly brand identity with floating outline on hover/focus
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm font-semibold leading-none transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none",
    {
        variants: {
            variant: {
                // Primary: Flat with darken on hover
                default:
                    "btn-primary-gradient text-primary-foreground dark:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
                // Secondary: Flat with darken on hover
                secondary:
                    "btn-secondary-gradient text-foreground border border-muted-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgba(107,114,128,0.5)] focus-visible:outline-offset-2",
                // Destructive: Flat red with darken on hover
                destructive:
                    "btn-destructive-gradient text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-destructive focus-visible:outline-offset-2 dark:focus-visible:outline-[rgba(255,107,107,0.6)]",
                // Ghost: Transparent, subtle bg on hover (no outline)
                ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgba(107,114,128,0.5)] focus-visible:outline-offset-2 active:bg-muted/80",
                // Outline: Border only, flat bg on hover/active
                outline:
                    "bg-transparent border border-muted-foreground/40 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-[rgba(107,114,128,0.5)] focus-visible:outline-offset-2 active:bg-muted",
                // Link: Text only with underline (no outline)
                link: "text-primary underline-offset-4 hover:text-primary-dark hover:underline p-0 h-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:text-primary-dark",
                // Success: Flat green with darken on hover
                success:
                    "btn-success-gradient text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-success focus-visible:outline-offset-2 dark:focus-visible:outline-[rgba(74,222,128,0.6)]",
                // Warning: Flat orange with darken on hover
                warning:
                    "btn-warning-gradient text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-warning focus-visible:outline-offset-2 dark:focus-visible:outline-[rgba(252,120,50,0.7)]",
            },
            size: {
                // Default: 10px 20px padding, 14px font
                default: "h-10 px-5 py-2.5 text-sm",
                // Small: 8px 14px padding, 13px font
                sm: "h-8 px-3.5 py-2 text-[13px] rounded-md",
                // Large: 12px 24px padding, 16px font
                lg: "h-11 px-6 py-3 text-base",
                // Icon: 36x36px
                icon: "h-9 w-9 p-0",
                // Icon small: 24x24px
                "icon-sm": "h-6 w-6 p-0 rounded-md",
                // Icon large: 40x40px
                "icon-lg": "h-10 w-10 p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            loading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        const isIconOnly = size === "icon" || size === "icon-sm" || size === "icon-lg";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" />
                        {!isIconOnly && children}
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

// ButtonGroup component for grouping buttons together
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    orientation?: "horizontal" | "vertical";
    attached?: boolean;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
    ({ className, orientation = "horizontal", attached = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                role="group"
                className={cn(
                    "inline-flex",
                    orientation === "vertical" ? "flex-col" : "flex-row",
                    attached && [
                        // Remove floating outline on hover, use flat bg instead
                        "[&>button]:hover:outline-none",
                        "[&>button]:btn-group-attached",
                        // Focus: keep inset ring
                        "[&>button]:focus-visible:outline-none",
                        "[&>button]:focus-visible:ring-2",
                        "[&>button]:focus-visible:ring-primary",
                        "[&>button]:focus-visible:ring-inset",
                        "[&>button]:relative",
                        "[&>button:hover]:z-10",
                        "[&>button:focus-visible]:z-10",
                    ],
                    attached &&
                        orientation === "horizontal" && [
                            "[&>button]:rounded-none",
                            "[&>button:first-child]:rounded-l-lg",
                            "[&>button:last-child]:rounded-r-lg",
                            "[&>button:not(:first-child)]:-ml-px",
                        ],
                    attached &&
                        orientation === "vertical" && [
                            "[&>button]:rounded-none",
                            "[&>button:first-child]:rounded-t-lg",
                            "[&>button:last-child]:rounded-b-lg",
                            "[&>button:not(:first-child)]:-mt-px",
                        ],
                    !attached && "gap-2",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
ButtonGroup.displayName = "ButtonGroup";

export { Button, ButtonGroup, buttonVariants };
