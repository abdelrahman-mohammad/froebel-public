"use client";

import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";

import { ShowcaseItem } from "../ShowcaseItem";

export function InputShowcase() {
    return (
        <ShowcaseItem title="Input" description="Text input field with size variants and states">
            <div className="space-y-6 max-w-md">
                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
                    <div className="space-y-3">
                        <Input size="sm" placeholder="Small input" />
                        <Input size="default" placeholder="Default input" />
                        <Input size="lg" placeholder="Large input" />
                    </div>
                </div>

                {/* Types */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Input Types</h4>
                    <div className="space-y-3">
                        <Input type="text" placeholder="Text input" />
                        <Input type="email" placeholder="Email input" />
                        <Input type="password" placeholder="Password input" />
                    </div>
                </div>

                {/* Number Input */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Number Input (with +/- buttons)
                    </h4>
                    <div className="space-y-3">
                        <NumberInput placeholder="Enter a number" />
                        <NumberInput
                            placeholder="With min/max (0-100)"
                            min={0}
                            max={100}
                            defaultValue={50}
                        />
                        <NumberInput placeholder="With step (5)" step={5} defaultValue={0} />
                        <NumberInput placeholder="Disabled" disabled defaultValue={25} />
                    </div>
                </div>

                {/* States */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">States</h4>
                    <div className="space-y-3">
                        <Input placeholder="Normal state" />
                        <Input placeholder="Disabled state" disabled />
                        <Input placeholder="Invalid state" aria-invalid="true" />
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
