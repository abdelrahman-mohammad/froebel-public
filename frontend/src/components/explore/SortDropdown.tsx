"use client";

import { ArrowUpDown } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import type { SortOption } from "@/lib/quiz/types";

interface SortDropdownProps {
    value: SortOption;
    onChange: (sort: SortOption) => void;
    disabled?: boolean;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "popular", label: "Most Popular" },
    { value: "updated", label: "Recently Updated" },
];

export function SortDropdown({ value, onChange, disabled }: SortDropdownProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger size="sm" className="w-fit min-w-[140px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default SortDropdown;
