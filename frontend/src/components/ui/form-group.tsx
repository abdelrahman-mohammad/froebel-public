import * as React from "react";

import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const formGroupVariants = cva(
    // Quiz Replay: Form group container
    "space-y-2",
    {
        variants: {
            spacing: {
                default: "mb-5",
                sm: "mb-3",
                lg: "mb-6",
                none: "mb-0",
            },
        },
        defaultVariants: {
            spacing: "default",
        },
    }
);

interface FormGroupProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof formGroupVariants> {
    label?: string;
    hint?: string;
    required?: boolean;
    htmlFor?: string;
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
    ({ className, spacing, label, hint, required, htmlFor, children, ...props }, ref) => (
        <div ref={ref} className={cn(formGroupVariants({ spacing }), className)} {...props}>
            {label && (
                <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
);
FormGroup.displayName = "FormGroup";

const FormLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement> & {
        required?: boolean;
    }
>(({ className, required, children, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            // Quiz Replay: Label - 600 weight, 14px font
            "block text-sm font-semibold text-foreground",
            className
        )}
        {...props}
    >
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
    </label>
));
FormLabel.displayName = "FormLabel";

const FormHint = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn(
                // Quiz Replay: Hint - 12px font, light text
                "text-xs text-muted-foreground",
                className
            )}
            {...props}
        />
    )
);
FormHint.displayName = "FormHint";

const FormError = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            // Quiz Replay: Error message
            "text-xs text-destructive font-medium",
            className
        )}
        {...props}
    />
));
FormError.displayName = "FormError";

export { FormGroup, FormLabel, FormHint, FormError, formGroupVariants };
