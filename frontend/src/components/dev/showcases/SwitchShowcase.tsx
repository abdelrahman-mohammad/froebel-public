"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { ShowcaseItem } from "../ShowcaseItem";

export function SwitchShowcase() {
    const [enabled, setEnabled] = useState(false);

    return (
        <ShowcaseItem title="Switch" description="Toggle switch for on/off states">
            <div className="space-y-6">
                {/* States */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">States</h4>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <Switch id="switch-off" />
                            <Label htmlFor="switch-off">Off</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch id="switch-on" defaultChecked />
                            <Label htmlFor="switch-on">On</Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch id="switch-disabled" disabled />
                            <Label htmlFor="switch-disabled" className="opacity-50">
                                Disabled Off
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch id="switch-disabled-on" disabled defaultChecked />
                            <Label htmlFor="switch-disabled-on" className="opacity-50">
                                Disabled On
                            </Label>
                        </div>
                    </div>
                </div>

                {/* Interactive */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Interactive</h4>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="switch-interactive"
                            checked={enabled}
                            onCheckedChange={setEnabled}
                        />
                        <Label htmlFor="switch-interactive">
                            Toggle me: {enabled ? "Enabled" : "Disabled"}
                        </Label>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
