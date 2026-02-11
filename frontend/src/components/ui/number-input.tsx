"use client";

import * as React from "react";

import type { VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { inputVariants } from "./input";

interface NumberInputProps
    extends
        Omit<React.ComponentProps<"input">, "type" | "size">,
        VariantProps<typeof inputVariants> {
    min?: number;
    max?: number;
    step?: number;
}

function NumberInput({
    className,
    size,
    min,
    max,
    step = 1,
    value,
    defaultValue,
    onChange,
    disabled,
    ...props
}: NumberInputProps) {
    const [internalValue, setInternalValue] = React.useState<string>(String(defaultValue ?? ""));

    const currentValue = value !== undefined ? String(value) : internalValue;
    const numericValue = parseFloat(currentValue) || 0;

    // Calculate decimal places from step for rounding
    const getDecimalPlaces = (num: number): number => {
        const str = num.toString();
        const decimalIndex = str.indexOf(".");
        return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
    };
    const decimalPlaces = getDecimalPlaces(step);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (value === undefined) {
            setInternalValue(newValue);
        }
        onChange?.(e);
    };

    const updateValue = (newValue: number) => {
        // Round to step precision to avoid floating point errors
        const roundedValue =
            decimalPlaces > 0
                ? Math.round(newValue * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)
                : Math.round(newValue);

        // Apply min/max constraints
        let constrainedValue = roundedValue;
        if (min !== undefined && constrainedValue < min) constrainedValue = min;
        if (max !== undefined && constrainedValue > max) constrainedValue = max;

        const stringValue = String(constrainedValue);

        if (value === undefined) {
            setInternalValue(stringValue);
        }

        // Create synthetic event for onChange
        const syntheticEvent = {
            target: { value: stringValue },
            currentTarget: { value: stringValue },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
    };

    const increment = () => {
        if (disabled) return;
        updateValue(numericValue + step);
    };

    const decrement = () => {
        if (disabled) return;
        updateValue(numericValue - step);
    };

    return (
        <div className="relative flex">
            <input
                type="number"
                data-slot="number-input"
                className={cn(
                    inputVariants({ size }),
                    // Hide native spinners
                    "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]",
                    // Make room for buttons
                    "pl-2 pr-2 rounded-r-none",
                    className
                )}
                value={currentValue}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                {...props}
            />
            {/* Stacked +/- buttons */}
            <div className="flex flex-col w-8 border border-l-0 border-border-light rounded-r-lg overflow-hidden self-stretch">
                <button
                    type="button"
                    onClick={increment}
                    disabled={disabled || (max !== undefined && numericValue >= max)}
                    className={cn(
                        "grid place-items-center flex-1 bg-background",
                        "hover:bg-accent hover:text-primary transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-foreground",
                        "border-b border-border-light"
                    )}
                    tabIndex={-1}
                    aria-label="Increment"
                >
                    <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={decrement}
                    disabled={disabled || (min !== undefined && numericValue <= min)}
                    className={cn(
                        "grid place-items-center flex-1 bg-background",
                        "hover:bg-accent hover:text-primary transition-colors",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-foreground"
                    )}
                    tabIndex={-1}
                    aria-label="Decrement"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

export { NumberInput };
