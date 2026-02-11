"use client";

import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bell,
    BellOff,
    Bold,
    Bookmark,
    Heart,
    Italic,
    Moon,
    Star,
    Sun,
    Underline,
} from "lucide-react";

import { Toggle } from "@/components/ui/toggle";

import { ShowcaseItem } from "../ShowcaseItem";

export function ToggleShowcase() {
    return (
        <ShowcaseItem title="Toggle" description="Two-state button that can be toggled on or off">
            <div className="space-y-6">
                {/* Basic */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
                    <div className="flex flex-wrap gap-3">
                        <Toggle aria-label="Toggle bold">
                            <Bold className="h-4 w-4" />
                        </Toggle>
                        <Toggle aria-label="Toggle italic">
                            <Italic className="h-4 w-4" />
                        </Toggle>
                        <Toggle aria-label="Toggle underline">
                            <Underline className="h-4 w-4" />
                        </Toggle>
                    </div>
                </div>

                {/* With Text */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Text</h4>
                    <div className="flex flex-wrap gap-3">
                        <Toggle aria-label="Toggle bold">
                            <Bold className="h-4 w-4 mr-2" />
                            Bold
                        </Toggle>
                        <Toggle aria-label="Toggle italic">
                            <Italic className="h-4 w-4 mr-2" />
                            Italic
                        </Toggle>
                    </div>
                </div>

                {/* Variants */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-3">
                        <Toggle variant="default" aria-label="Default toggle">
                            <Star className="h-4 w-4" />
                        </Toggle>
                        <Toggle variant="outline" aria-label="Outline toggle">
                            <Star className="h-4 w-4" />
                        </Toggle>
                    </div>
                </div>

                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
                    <div className="flex flex-wrap items-center gap-3">
                        <Toggle size="sm" aria-label="Small toggle">
                            <Heart className="h-3 w-3" />
                        </Toggle>
                        <Toggle size="default" aria-label="Default toggle">
                            <Heart className="h-4 w-4" />
                        </Toggle>
                        <Toggle size="lg" aria-label="Large toggle">
                            <Heart className="h-5 w-5" />
                        </Toggle>
                    </div>
                </div>

                {/* Default Pressed */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Default Pressed
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        <Toggle defaultPressed aria-label="Bookmarked">
                            <Bookmark className="h-4 w-4 mr-2" />
                            Bookmarked
                        </Toggle>
                        <Toggle defaultPressed aria-label="Favorited">
                            <Heart className="h-4 w-4 mr-2" />
                            Favorited
                        </Toggle>
                    </div>
                </div>

                {/* Disabled */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Disabled</h4>
                    <div className="flex flex-wrap gap-3">
                        <Toggle disabled aria-label="Disabled toggle">
                            <Star className="h-4 w-4" />
                        </Toggle>
                        <Toggle disabled defaultPressed aria-label="Disabled pressed toggle">
                            <Star className="h-4 w-4" />
                        </Toggle>
                    </div>
                </div>

                {/* Practical Examples */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Practical Examples
                    </h4>
                    <div className="space-y-4">
                        {/* Theme Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-24">Theme:</span>
                            <Toggle aria-label="Toggle dark mode">
                                <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
                            </Toggle>
                        </div>

                        {/* Notification Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-24">
                                Notifications:
                            </span>
                            <Toggle defaultPressed aria-label="Toggle notifications">
                                <Bell className="h-4 w-4" />
                            </Toggle>
                        </div>

                        {/* Text Formatting */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground w-24">Format:</span>
                            <div className="flex gap-1">
                                <Toggle size="sm" variant="outline" aria-label="Bold">
                                    <Bold className="h-3.5 w-3.5" />
                                </Toggle>
                                <Toggle size="sm" variant="outline" aria-label="Italic">
                                    <Italic className="h-3.5 w-3.5" />
                                </Toggle>
                                <Toggle size="sm" variant="outline" aria-label="Underline">
                                    <Underline className="h-3.5 w-3.5" />
                                </Toggle>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
