"use client";

import * as React from "react";

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    captionLayout = "label",
    formatters,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    const defaultClassNames = getDefaultClassNames();

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("bg-background p-3 [--cell-size:2.25rem]", className)}
            captionLayout={captionLayout}
            formatters={{
                formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
                ...formatters,
            }}
            classNames={{
                root: cn("w-fit", defaultClassNames.root),
                months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
                month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
                nav: cn(
                    "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
                    defaultClassNames.nav
                ),
                button_previous: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
                    defaultClassNames.button_previous
                ),
                button_next: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50",
                    defaultClassNames.button_next
                ),
                month_caption: cn(
                    "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size]",
                    defaultClassNames.month_caption
                ),
                dropdowns: cn(
                    "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
                    defaultClassNames.dropdowns
                ),
                dropdown_root: cn(
                    "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
                    defaultClassNames.dropdown_root
                ),
                dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
                caption_label: cn(
                    "select-none font-medium",
                    captionLayout === "label"
                        ? "text-sm"
                        : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-sm [&>svg]:size-3.5",
                    defaultClassNames.caption_label
                ),
                table: "w-full border-collapse",
                weekdays: cn("flex", defaultClassNames.weekdays),
                weekday: cn(
                    "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
                    defaultClassNames.weekday
                ),
                week: cn("mt-2 flex w-full", defaultClassNames.week),
                week_number_header: cn(
                    "w-[--cell-size] select-none",
                    defaultClassNames.week_number_header
                ),
                week_number: cn(
                    "text-muted-foreground select-none text-[0.8rem]",
                    defaultClassNames.week_number
                ),
                day: cn(
                    "group/day relative aspect-square h-full w-full select-none p-0 text-center",
                    defaultClassNames.day
                ),
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "flex aspect-square h-[--cell-size] w-[--cell-size] items-center justify-center p-0 font-normal",
                    "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary aria-selected:hover:text-primary-foreground",
                    defaultClassNames.day_button
                ),
                range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
                range_middle: cn("rounded-none", defaultClassNames.range_middle),
                range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
                today: cn("bg-accent text-accent-foreground rounded-md", defaultClassNames.today),
                outside: cn("text-muted-foreground opacity-50", defaultClassNames.outside),
                disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
                hidden: cn("invisible", defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Chevron: ({ className, orientation, ...props }) => {
                    if (orientation === "left") {
                        return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
                    }
                    if (orientation === "right") {
                        return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
                    }
                    return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
                },
            }}
            {...props}
        />
    );
}

export { Calendar };
