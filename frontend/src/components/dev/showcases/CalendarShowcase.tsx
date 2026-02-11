"use client";

import { useState } from "react";

import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar";

import { ShowcaseItem } from "../ShowcaseItem";

export function CalendarShowcase() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 7),
    });
    const [multipleDates, setMultipleDates] = useState<Date[] | undefined>([
        new Date(),
        addDays(new Date(), 2),
        addDays(new Date(), 5),
    ]);

    return (
        <ShowcaseItem title="Calendar" description="Date picker calendar component">
            <div className="space-y-6">
                {/* Basic */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
                    <div className="flex flex-wrap gap-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                        />
                        <div className="flex flex-col justify-center text-sm">
                            <p className="text-muted-foreground">Selected date:</p>
                            <p className="font-medium">{date ? format(date, "PPP") : "None"}</p>
                        </div>
                    </div>
                </div>

                {/* Range Selection */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Range Selection
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            className="rounded-md border"
                        />
                        <div className="flex flex-col justify-center text-sm">
                            <p className="text-muted-foreground">Selected range:</p>
                            <p className="font-medium">
                                {dateRange?.from ? format(dateRange.from, "PPP") : "Start"} -{" "}
                                {dateRange?.to ? format(dateRange.to, "PPP") : "End"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Multiple Selection */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Multiple Selection
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        <Calendar
                            mode="multiple"
                            selected={multipleDates}
                            onSelect={setMultipleDates}
                            className="rounded-md border"
                        />
                        <div className="flex flex-col justify-center text-sm">
                            <p className="text-muted-foreground">Selected dates:</p>
                            <ul className="font-medium">
                                {multipleDates?.map((d, i) => (
                                    <li key={i}>{format(d, "PPP")}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* With Constraints */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        With Date Constraints
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Future dates only</p>
                            <Calendar
                                mode="single"
                                disabled={(date) => date < new Date()}
                                className="rounded-md border"
                            />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Weekdays only</p>
                            <Calendar
                                mode="single"
                                disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
                                className="rounded-md border"
                            />
                        </div>
                    </div>
                </div>

                {/* Caption Layout */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        With Dropdowns
                    </h4>
                    <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        fromYear={2020}
                        toYear={2030}
                        className="rounded-md border"
                    />
                </div>

                {/* Without Outside Days */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Without Outside Days
                    </h4>
                    <Calendar mode="single" showOutsideDays={false} className="rounded-md border" />
                </div>
            </div>
        </ShowcaseItem>
    );
}
