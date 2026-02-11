"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { ShowcaseItem } from "../ShowcaseItem";

export function CheckboxShowcase() {
    const [checked, setChecked] = useState(false);

    return (
        <ShowcaseItem title="Checkbox" description="Checkbox input for toggling options">
            <div className="space-y-6">
                {/* States */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">States</h4>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Checkbox id="unchecked" />
                            <Label htmlFor="unchecked">Unchecked</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="checked" defaultChecked />
                            <Label htmlFor="checked">Checked</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="disabled" disabled />
                            <Label htmlFor="disabled" className="opacity-50">
                                Disabled
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="disabled-checked" disabled defaultChecked />
                            <Label htmlFor="disabled-checked" className="opacity-50">
                                Disabled Checked
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="invalid" aria-invalid="true" />
                            <Label htmlFor="invalid" className="text-destructive">
                                Invalid
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Interactive */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Interactive</h4>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="interactive"
                            checked={checked}
                            onCheckedChange={(c) => setChecked(c === true)}
                        />
                        <Label htmlFor="interactive">
                            Click me: {checked ? "Checked" : "Unchecked"}
                        </Label>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
