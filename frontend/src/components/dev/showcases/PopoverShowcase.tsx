"use client";

import { HelpCircle, Info, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { ShowcaseItem } from "../ShowcaseItem";

export function PopoverShowcase() {
    return (
        <ShowcaseItem
            title="Popover"
            description="Floating content triggered by a button or element"
        >
            <div className="space-y-6">
                {/* Basic Popover */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
                    <div className="flex flex-wrap gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Open Popover</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Popover Title</h4>
                                    <p className="text-sm text-muted-foreground">
                                        This is some popover content with helpful information.
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Alignment */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Alignment</h4>
                    <div className="flex flex-wrap gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Align Start</Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-48">
                                <p className="text-sm">Aligned to start</p>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Align Center</Button>
                            </PopoverTrigger>
                            <PopoverContent align="center" className="w-48">
                                <p className="text-sm">Aligned to center</p>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Align End</Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-48">
                                <p className="text-sm">Aligned to end</p>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* With Form */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        With Form Content
                    </h4>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Dimensions</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Set the dimensions for the layer.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="width">Width</Label>
                                        <Input
                                            id="width"
                                            defaultValue="100%"
                                            className="col-span-2 h-8"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="height">Height</Label>
                                        <Input
                                            id="height"
                                            defaultValue="25px"
                                            className="col-span-2 h-8"
                                        />
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Icon Triggers */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Icon Triggers
                    </h4>
                    <div className="flex flex-wrap items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Info className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                                <p className="text-sm">
                                    This is an informational popover triggered by an icon button.
                                </p>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <HelpCircle className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Need help?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Click here to learn more about this feature.
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
