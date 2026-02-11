"use client";

import { Progress } from "@/components/ui/progress";

import { ShowcaseItem } from "../ShowcaseItem";

export function ProgressShowcase() {
    return (
        <ShowcaseItem
            title="Progress"
            description="Visual indicator of progress with color variants"
        >
            <div className="space-y-6 max-w-md">
                {/* Progress Values */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Progress Values
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-muted-foreground">0%</span>
                            <Progress value={0} />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">25%</span>
                            <Progress value={25} />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">50%</span>
                            <Progress value={50} />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">75%</span>
                            <Progress value={75} />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">100%</span>
                            <Progress value={100} />
                        </div>
                    </div>
                </div>

                {/* Variants */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Variants</h4>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-muted-foreground">Default</span>
                            <Progress value={60} variant="default" />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">Success</span>
                            <Progress value={60} variant="success" />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">Warning</span>
                            <Progress value={60} variant="warning" />
                        </div>
                        <div>
                            <span className="text-xs text-muted-foreground">Danger</span>
                            <Progress value={60} variant="danger" />
                        </div>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
