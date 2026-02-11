"use client";

import { useState } from "react";

import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Grid2X2,
    Grid3X3,
    Italic,
    LayoutGrid,
    List,
    ListOrdered,
    Underline,
} from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { ShowcaseItem } from "../ShowcaseItem";

export function ToggleGroupShowcase() {
    const [alignment, setAlignment] = useState("left");
    const [view, setView] = useState("grid");

    return (
        <ShowcaseItem
            title="Toggle Group"
            description="Group of toggle buttons where one or more can be selected"
        >
            <div className="space-y-6">
                {/* Single Selection */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Single Selection
                    </h4>
                    <ToggleGroup type="single" defaultValue="center">
                        <ToggleGroupItem value="left" aria-label="Align left">
                            <AlignLeft className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="center" aria-label="Align center">
                            <AlignCenter className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="right" aria-label="Align right">
                            <AlignRight className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="justify" aria-label="Justify">
                            <AlignJustify className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Multiple Selection */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Multiple Selection
                    </h4>
                    <ToggleGroup type="multiple" defaultValue={["bold"]}>
                        <ToggleGroupItem value="bold" aria-label="Toggle bold">
                            <Bold className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="italic" aria-label="Toggle italic">
                            <Italic className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="underline" aria-label="Toggle underline">
                            <Underline className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Outline Variant */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Outline Variant
                    </h4>
                    <ToggleGroup type="single" variant="outline" defaultValue="list">
                        <ToggleGroupItem value="list" aria-label="List view">
                            <List className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="ordered" aria-label="Ordered list">
                            <ListOrdered className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
                    <div className="space-y-3">
                        <ToggleGroup type="single" size="sm" defaultValue="left">
                            <ToggleGroupItem value="left" aria-label="Left">
                                <AlignLeft className="h-3.5 w-3.5" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="center" aria-label="Center">
                                <AlignCenter className="h-3.5 w-3.5" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="right" aria-label="Right">
                                <AlignRight className="h-3.5 w-3.5" />
                            </ToggleGroupItem>
                        </ToggleGroup>

                        <ToggleGroup type="single" size="default" defaultValue="left">
                            <ToggleGroupItem value="left" aria-label="Left">
                                <AlignLeft className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="center" aria-label="Center">
                                <AlignCenter className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="right" aria-label="Right">
                                <AlignRight className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>

                        <ToggleGroup type="single" size="lg" defaultValue="left">
                            <ToggleGroupItem value="left" aria-label="Left">
                                <AlignLeft className="h-5 w-5" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="center" aria-label="Center">
                                <AlignCenter className="h-5 w-5" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="right" aria-label="Right">
                                <AlignRight className="h-5 w-5" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </div>

                {/* With Labels */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Labels</h4>
                    <ToggleGroup type="single" defaultValue="grid">
                        <ToggleGroupItem value="grid" aria-label="Grid view">
                            <Grid2X2 className="h-4 w-4 mr-2" />
                            Grid
                        </ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List view">
                            <List className="h-4 w-4 mr-2" />
                            List
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>

                {/* Controlled */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Controlled</h4>
                    <div className="space-y-3">
                        <ToggleGroup
                            type="single"
                            value={view}
                            onValueChange={(value) => value && setView(value)}
                        >
                            <ToggleGroupItem value="small" aria-label="Small grid">
                                <Grid2X2 className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="medium" aria-label="Medium grid">
                                <Grid3X3 className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="grid" aria-label="Large grid">
                                <LayoutGrid className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>
                        <p className="text-sm text-muted-foreground">Selected: {view}</p>
                    </div>
                </div>

                {/* Disabled */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Disabled</h4>
                    <ToggleGroup type="single" defaultValue="left" disabled>
                        <ToggleGroupItem value="left" aria-label="Left">
                            <AlignLeft className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="center" aria-label="Center">
                            <AlignCenter className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="right" aria-label="Right">
                            <AlignRight className="h-4 w-4" />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>
        </ShowcaseItem>
    );
}
