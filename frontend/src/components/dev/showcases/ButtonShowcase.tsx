"use client";

import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    ChevronRight,
    Italic,
    Plus,
    Settings,
    Trash,
    Underline,
} from "lucide-react";

import { Button, ButtonGroup } from "@/components/ui/button";

import { ShowcaseItem } from "../ShowcaseItem";

export function ButtonShowcase() {
    return (
        <ShowcaseItem
            title="Button"
            description="Primary action component with multiple variants and sizes"
        >
            <div className="space-y-6">
                {/* Variants */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="default">Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="success">Success</Button>
                        <Button variant="warning">Warning</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="link">Link</Button>
                    </div>
                </div>

                {/* Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h4>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                    </div>
                </div>

                {/* Icon Sizes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Icon Buttons</h4>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="icon-sm">
                            <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button size="icon-lg">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* With Icons */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Icons</h4>
                    <div className="flex flex-wrap gap-3">
                        <Button>
                            <Plus className="h-4 w-4" /> Create
                        </Button>
                        <Button variant="destructive">
                            <Trash className="h-4 w-4" /> Delete
                        </Button>
                        <Button variant="secondary">
                            Settings <Settings className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost">
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* States */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">States</h4>
                    <div className="space-y-4">
                        {/* Normal */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Normal</p>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="default">Default</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="destructive">Destructive</Button>
                                <Button variant="success">Success</Button>
                                <Button variant="warning">Warning</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="outline">Outline</Button>
                            </div>
                        </div>

                        {/* Focus */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Focus</p>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="default"
                                    className="outline outline-2 outline-primary outline-offset-2"
                                >
                                    Default
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="outline outline-2 outline-[rgba(107,114,128,0.5)] outline-offset-2"
                                >
                                    Secondary
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="outline outline-2 outline-destructive outline-offset-2"
                                >
                                    Destructive
                                </Button>
                                <Button
                                    variant="success"
                                    className="outline outline-2 outline-success outline-offset-2"
                                >
                                    Success
                                </Button>
                                <Button
                                    variant="warning"
                                    className="outline outline-2 outline-warning outline-offset-2"
                                >
                                    Warning
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="outline outline-2 outline-[rgba(107,114,128,0.5)] outline-offset-2"
                                >
                                    Ghost
                                </Button>
                                <Button
                                    variant="outline"
                                    className="outline outline-2 outline-[rgba(107,114,128,0.5)] outline-offset-2"
                                >
                                    Outline
                                </Button>
                            </div>
                        </div>

                        {/* Active */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Active (Pressed)</p>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="default"
                                    className="translate-y-[2px] !bg-[#094a6d] dark:!bg-[#1f5a85]"
                                >
                                    Default
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="translate-y-[2px] !bg-[#b4b4b8] dark:!bg-[#0f0f0f]"
                                >
                                    Secondary
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="translate-y-[2px] !bg-[#a12020]"
                                >
                                    Destructive
                                </Button>
                                <Button
                                    variant="success"
                                    className="translate-y-[2px] !bg-[#07522e]"
                                >
                                    Success
                                </Button>
                                <Button
                                    variant="warning"
                                    className="translate-y-[2px] !bg-[#b34001]"
                                >
                                    Warning
                                </Button>
                                <Button variant="ghost" className="bg-muted/80">
                                    Ghost
                                </Button>
                                <Button variant="outline" className="bg-muted">
                                    Outline
                                </Button>
                            </div>
                        </div>

                        {/* Disabled */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Disabled</p>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="default" disabled>
                                    Default
                                </Button>
                                <Button variant="secondary" disabled>
                                    Secondary
                                </Button>
                                <Button variant="destructive" disabled>
                                    Destructive
                                </Button>
                                <Button variant="success" disabled>
                                    Success
                                </Button>
                                <Button variant="warning" disabled>
                                    Warning
                                </Button>
                                <Button variant="ghost" disabled>
                                    Ghost
                                </Button>
                                <Button variant="outline" disabled>
                                    Outline
                                </Button>
                            </div>
                        </div>

                        {/* Loading */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Loading</p>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="default" loading>
                                    Default
                                </Button>
                                <Button variant="secondary" loading>
                                    Secondary
                                </Button>
                                <Button variant="destructive" loading>
                                    Destructive
                                </Button>
                                <Button variant="success" loading>
                                    Success
                                </Button>
                                <Button variant="warning" loading>
                                    Warning
                                </Button>
                                <Button variant="ghost" loading>
                                    Ghost
                                </Button>
                                <Button variant="outline" loading>
                                    Outline
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Button Groups */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Button Groups
                    </h4>
                    <div className="space-y-4">
                        {/* Spaced group */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Spaced (default)</p>
                            <ButtonGroup>
                                <Button variant="secondary">One</Button>
                                <Button variant="secondary">Two</Button>
                                <Button variant="secondary">Three</Button>
                            </ButtonGroup>
                        </div>

                        {/* Attached group */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Attached</p>
                            <ButtonGroup attached>
                                <Button variant="outline">
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button variant="outline">
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Button variant="outline">
                                    <Underline className="h-4 w-4" />
                                </Button>
                            </ButtonGroup>
                        </div>

                        {/* Attached with text */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">
                                Attached with alignment
                            </p>
                            <ButtonGroup attached>
                                <Button variant="secondary">
                                    <AlignLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary">
                                    <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary">
                                    <AlignRight className="h-4 w-4" />
                                </Button>
                            </ButtonGroup>
                        </div>

                        {/* Vertical group */}
                        <div>
                            <p className="text-xs text-muted-foreground mb-2">Vertical attached</p>
                            <ButtonGroup orientation="vertical" attached>
                                <Button variant="outline">Top</Button>
                                <Button variant="outline">Middle</Button>
                                <Button variant="outline">Bottom</Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
