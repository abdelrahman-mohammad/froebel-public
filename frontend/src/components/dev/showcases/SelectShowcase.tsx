"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { ShowcaseItem } from "../ShowcaseItem";

export function SelectShowcase() {
    return (
        <ShowcaseItem title="Select" description="Dropdown select component with size variants">
            <div className="space-y-6">
                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
                    <div className="flex flex-wrap gap-3">
                        <Select>
                            <SelectTrigger size="sm" className="w-[180px]">
                                <SelectValue placeholder="Small select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                                <SelectItem value="option2">Option 2</SelectItem>
                                <SelectItem value="option3">Option 3</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select>
                            <SelectTrigger size="default" className="w-[180px]">
                                <SelectValue placeholder="Default select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                                <SelectItem value="option2">Option 2</SelectItem>
                                <SelectItem value="option3">Option 3</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* States */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">States</h4>
                    <div className="flex flex-wrap gap-3">
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Normal state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                                <SelectItem value="option2">Option 2</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select disabled>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Disabled state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select>
                            <SelectTrigger className="w-[180px]" aria-invalid="true">
                                <SelectValue placeholder="Invalid state" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="option1">Option 1</SelectItem>
                                <SelectItem value="option2">Option 2</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
