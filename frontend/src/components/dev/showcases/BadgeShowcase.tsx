"use client";

import { AlertCircle, Check, Clock, Star, X, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { ShowcaseItem } from "../ShowcaseItem";

export function BadgeShowcase() {
    return (
        <ShowcaseItem title="Badge" description="Small status indicator for labels and tags">
            <div className="space-y-6">
                {/* Variants */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="default">Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="outline">Outline</Badge>
                    </div>
                </div>

                {/* With Icons */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Icons</h4>
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="default">
                            <Check /> Approved
                        </Badge>
                        <Badge variant="destructive">
                            <X /> Rejected
                        </Badge>
                        <Badge variant="secondary">
                            <Clock /> Pending
                        </Badge>
                        <Badge variant="outline">
                            <AlertCircle /> Review
                        </Badge>
                    </div>
                </div>

                {/* Use Cases */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Example Use Cases
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="default">
                            <Star /> Featured
                        </Badge>
                        <Badge variant="secondary">
                            <Zap /> Pro
                        </Badge>
                        <Badge variant="default">New</Badge>
                        <Badge variant="outline">v1.0.0</Badge>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
