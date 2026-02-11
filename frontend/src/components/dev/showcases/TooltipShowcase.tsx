"use client";

import { Copy, HelpCircle, Info, Save, Settings, Undo } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { ShowcaseItem } from "../ShowcaseItem";

export function TooltipShowcase() {
    return (
        <ShowcaseItem
            title="Tooltip"
            description="Hover-triggered tooltip for additional information"
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Basic */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            Basic Usage
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline">Hover me</Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>This is a tooltip</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>More information</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <HelpCircle className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Need help?</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Settings</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Positions */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            Positions
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="sm">
                                        Top
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p>Tooltip on top</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="sm">
                                        Bottom
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p>Tooltip on bottom</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="sm">
                                        Left
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>Tooltip on left</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="sm">
                                        Right
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Tooltip on right</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* With Keyboard Shortcuts */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            With Keyboard Shortcuts
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="icon">
                                        <Save className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="flex items-center gap-2">
                                    <span>Save</span>
                                    <span className="flex items-center gap-0.5">
                                        <Kbd variant="inverted">Ctrl</Kbd>
                                        <Kbd variant="inverted">S</Kbd>
                                    </span>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="icon">
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="flex items-center gap-2">
                                    <span>Copy</span>
                                    <span className="flex items-center gap-0.5">
                                        <Kbd variant="inverted">Ctrl</Kbd>
                                        <Kbd variant="inverted">C</Kbd>
                                    </span>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="secondary" size="icon">
                                        <Undo className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="flex items-center gap-2">
                                    <span>Undo</span>
                                    <span className="flex items-center gap-0.5">
                                        <Kbd variant="inverted">Ctrl</Kbd>
                                        <Kbd variant="inverted">Z</Kbd>
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Kbd Component Standalone */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            Kbd Component (standalone)
                        </h4>
                        <div className="flex flex-wrap items-center gap-2">
                            <Kbd>Ctrl</Kbd>
                            <span className="text-muted-foreground">+</span>
                            <Kbd>Shift</Kbd>
                            <span className="text-muted-foreground">+</span>
                            <Kbd>P</Kbd>
                            <span className="text-sm text-muted-foreground">Command palette</span>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        </ShowcaseItem>
    );
}
