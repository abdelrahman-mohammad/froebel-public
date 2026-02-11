"use client";

import { useState } from "react";

import { Star, Trophy, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";

import { ShowcaseItem } from "../ShowcaseItem";

export function CircularProgressShowcase() {
    const [progress, setProgress] = useState(65);

    return (
        <ShowcaseItem
            title="Circular Progress"
            description="Circular progress indicators with various styles"
        >
            <div className="space-y-6">
                {/* Basic Progress */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
                    <div className="flex flex-wrap items-center gap-6">
                        <CircularProgress value={25} showValue />
                        <CircularProgress value={50} showValue />
                        <CircularProgress value={75} showValue />
                        <CircularProgress value={100} showValue />
                    </div>
                </div>

                {/* Variants */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Variants</h4>
                    <div className="flex flex-wrap items-center gap-6">
                        <CircularProgress value={75} variant="default" showValue />
                        <CircularProgress value={75} variant="success" showValue />
                        <CircularProgress value={75} variant="warning" showValue />
                        <CircularProgress value={75} variant="danger" showValue />
                    </div>
                </div>

                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
                    <div className="flex flex-wrap items-end gap-6">
                        <CircularProgress value={65} size={60} strokeWidth={4} showValue />
                        <CircularProgress value={65} size={90} strokeWidth={6} showValue />
                        <CircularProgress value={65} size={120} strokeWidth={8} showValue />
                        <CircularProgress value={65} size={160} strokeWidth={10} showValue />
                    </div>
                </div>

                {/* With Custom Content */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Custom Content
                    </h4>
                    <div className="flex flex-wrap items-center gap-6">
                        <CircularProgress value={80} variant="success" size={100}>
                            <Trophy className="h-8 w-8 text-success" />
                        </CircularProgress>
                        <CircularProgress value={45} variant="warning" size={100}>
                            <Star className="h-8 w-8 text-warning" />
                        </CircularProgress>
                        <CircularProgress value={92} variant="default" size={100}>
                            <div className="text-center">
                                <div className="text-2xl font-bold">A+</div>
                                <div className="text-xs text-muted-foreground">Grade</div>
                            </div>
                        </CircularProgress>
                        <CircularProgress value={33} variant="danger" size={100}>
                            <Zap className="h-8 w-8 text-destructive" />
                        </CircularProgress>
                    </div>
                </div>

                {/* Interactive */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Interactive</h4>
                    <div className="flex items-center gap-6">
                        <CircularProgress
                            value={progress}
                            variant={
                                progress >= 80 ? "success" : progress >= 50 ? "warning" : "danger"
                            }
                            size={140}
                            strokeWidth={10}
                            showValue
                        />
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setProgress(Math.max(0, progress - 10))}
                                >
                                    -10
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setProgress(Math.min(100, progress + 10))}
                                >
                                    +10
                                </Button>
                            </div>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setProgress(Math.floor(Math.random() * 101))}
                            >
                                Random
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Example */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Dashboard Example
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        <div className="p-4 border rounded-lg bg-card text-center">
                            <CircularProgress value={87} variant="success" size={80} showValue />
                            <p className="mt-2 text-sm font-medium">Accuracy</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-card text-center">
                            <CircularProgress value={65} variant="warning" size={80} showValue />
                            <p className="mt-2 text-sm font-medium">Completion</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-card text-center">
                            <CircularProgress value={42} variant="danger" size={80} showValue />
                            <p className="mt-2 text-sm font-medium">Time Left</p>
                        </div>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
