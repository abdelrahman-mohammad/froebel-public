"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";

import { ShowcaseItem } from "../ShowcaseItem";

export function NumberInputShowcase() {
    const [value1, setValue1] = useState("5");
    const [value2, setValue2] = useState("0");

    return (
        <ShowcaseItem
            title="Number Input"
            description="Numeric input with increment/decrement buttons"
        >
            <div className="space-y-6">
                {/* Basic */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
                    <div className="flex flex-wrap gap-4">
                        <NumberInput placeholder="Enter number" />
                    </div>
                </div>

                {/* With Value */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Controlled</h4>
                    <div className="flex items-center gap-4">
                        <NumberInput value={value1} onChange={(e) => setValue1(e.target.value)} />
                        <span className="text-sm text-muted-foreground">Value: {value1}</span>
                    </div>
                </div>

                {/* Min/Max Constraints */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Min/Max</h4>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-2">
                            <Label>Quantity (1-10)</Label>
                            <NumberInput min={1} max={10} defaultValue="1" />
                        </div>
                        <div className="space-y-2">
                            <Label>Age (0-120)</Label>
                            <NumberInput min={0} max={120} defaultValue="25" />
                        </div>
                        <div className="space-y-2">
                            <Label>Rating (0-5)</Label>
                            <NumberInput min={0} max={5} defaultValue="3" />
                        </div>
                    </div>
                </div>

                {/* Custom Step */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Custom Step</h4>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-2">
                            <Label>Step: 1 (default)</Label>
                            <NumberInput step={1} defaultValue="10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Step: 5</Label>
                            <NumberInput step={5} defaultValue="10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Step: 0.1</Label>
                            <NumberInput step={0.1} defaultValue="1.5" />
                        </div>
                        <div className="space-y-2">
                            <Label>Step: 0.01</Label>
                            <NumberInput step={0.01} defaultValue="9.99" />
                        </div>
                    </div>
                </div>

                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <Label>Small</Label>
                            <NumberInput size="sm" defaultValue="5" />
                        </div>
                        <div className="space-y-2">
                            <Label>Default</Label>
                            <NumberInput defaultValue="5" />
                        </div>
                        <div className="space-y-2">
                            <Label>Large</Label>
                            <NumberInput size="lg" defaultValue="5" />
                        </div>
                    </div>
                </div>

                {/* States */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">States</h4>
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="space-y-2">
                            <Label>Normal</Label>
                            <NumberInput defaultValue="42" />
                        </div>
                        <div className="space-y-2">
                            <Label>Disabled</Label>
                            <NumberInput defaultValue="42" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>At Max (10)</Label>
                            <NumberInput defaultValue="10" max={10} />
                        </div>
                        <div className="space-y-2">
                            <Label>At Min (0)</Label>
                            <NumberInput defaultValue="0" min={0} />
                        </div>
                    </div>
                </div>

                {/* Practical Examples */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Practical Examples
                    </h4>
                    <div className="flex flex-wrap items-end gap-6">
                        <div className="space-y-2">
                            <Label>Questions per quiz</Label>
                            <NumberInput min={1} max={100} step={5} defaultValue="10" />
                        </div>
                        <div className="space-y-2">
                            <Label>Time limit (minutes)</Label>
                            <NumberInput min={1} max={180} step={5} defaultValue="30" />
                        </div>
                        <div className="space-y-2">
                            <Label>Passing score (%)</Label>
                            <NumberInput
                                min={0}
                                max={100}
                                step={5}
                                value={value2}
                                onChange={(e) => setValue2(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
