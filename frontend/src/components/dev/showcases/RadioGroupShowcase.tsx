"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { ShowcaseItem } from "../ShowcaseItem";

export function RadioGroupShowcase() {
    const [value, setValue] = useState("option1");

    return (
        <ShowcaseItem
            title="Radio Group"
            description="Radio button group for selecting one option from a set"
        >
            <div className="space-y-6">
                {/* Default */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Default</h4>
                    <RadioGroup defaultValue="option1">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option1" id="r1" />
                            <Label htmlFor="r1">Option 1</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option2" id="r2" />
                            <Label htmlFor="r2">Option 2</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option3" id="r3" />
                            <Label htmlFor="r3">Option 3</Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Disabled */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Disabled</h4>
                    <RadioGroup disabled defaultValue="option1">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option1" id="rd1" />
                            <Label htmlFor="rd1" className="opacity-50">
                                Disabled option 1
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option2" id="rd2" />
                            <Label htmlFor="rd2" className="opacity-50">
                                Disabled option 2
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Interactive */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Interactive (Selected: {value})
                    </h4>
                    <RadioGroup value={value} onValueChange={setValue}>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option1" id="ri1" />
                            <Label htmlFor="ri1">First option</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option2" id="ri2" />
                            <Label htmlFor="ri2">Second option</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="option3" id="ri3" />
                            <Label htmlFor="ri3">Third option</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </ShowcaseItem>
    );
}
