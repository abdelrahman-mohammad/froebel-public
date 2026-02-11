"use client";

import { Textarea } from "@/components/ui/textarea";

import { ShowcaseItem } from "../ShowcaseItem";

export function TextareaShowcase() {
    return (
        <ShowcaseItem title="Textarea" description="Multi-line text input with size variants">
            <div className="space-y-6 max-w-md">
                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
                    <div className="space-y-3">
                        <Textarea size="sm" placeholder="Small textarea" />
                        <Textarea size="default" placeholder="Default textarea" />
                        <Textarea size="lg" placeholder="Large textarea" />
                    </div>
                </div>

                {/* States */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">States</h4>
                    <div className="space-y-3">
                        <Textarea placeholder="Normal state" />
                        <Textarea placeholder="Disabled state" disabled />
                        <Textarea placeholder="Invalid state" aria-invalid="true" />
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
