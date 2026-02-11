"use client";

import { useState } from "react";

import { ChevronDown, ChevronsUpDown, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { ShowcaseItem } from "../ShowcaseItem";

export function CollapsibleShowcase() {
    const [isOpen1, setIsOpen1] = useState(false);
    const [isOpen2, setIsOpen2] = useState(true);
    const [isOpen3, setIsOpen3] = useState(false);

    return (
        <ShowcaseItem title="Collapsible" description="Expandable content sections">
            <div className="space-y-6">
                {/* Basic */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
                    <Collapsible
                        open={isOpen1}
                        onOpenChange={setIsOpen1}
                        className="w-[350px] space-y-2"
                    >
                        <div className="flex items-center justify-between space-x-4 px-4">
                            <h4 className="text-sm font-semibold">@radix-ui/primitives</h4>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <ChevronsUpDown className="h-4 w-4" />
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                            @radix-ui/react-collapsible
                        </div>
                        <CollapsibleContent className="space-y-2">
                            <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                                @radix-ui/react-accordion
                            </div>
                            <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                                @radix-ui/react-dialog
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* Default Open */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Default Open</h4>
                    <Collapsible
                        open={isOpen2}
                        onOpenChange={setIsOpen2}
                        className="w-[350px] space-y-2"
                    >
                        <div className="flex items-center justify-between space-x-4 px-4">
                            <h4 className="text-sm font-semibold">Section Title</h4>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    {isOpen2 ? (
                                        <X className="h-4 w-4" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent>
                            <div className="rounded-md border bg-muted/50 px-4 py-3 text-sm">
                                This content is visible by default. Click the button to collapse it.
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* Card Style */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Card Style</h4>
                    <Collapsible
                        open={isOpen3}
                        onOpenChange={setIsOpen3}
                        className="w-[400px] rounded-lg border bg-card"
                    >
                        <CollapsibleTrigger asChild>
                            <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                <div>
                                    <h4 className="text-sm font-semibold">Quiz Settings</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Configure quiz parameters
                                    </p>
                                </div>
                                <ChevronDown
                                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                                        isOpen3 ? "rotate-180" : ""
                                    }`}
                                />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="border-t p-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Time Limit</span>
                                    <span>30 minutes</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Passing Score</span>
                                    <span>70%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Attempts</span>
                                    <span>Unlimited</span>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* Multiple Sections */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Multiple Sections
                    </h4>
                    <div className="w-[400px] space-y-2">
                        {["Section 1", "Section 2", "Section 3"].map((section, index) => (
                            <Collapsible key={section} className="rounded-lg border">
                                <CollapsibleTrigger asChild>
                                    <div className="flex cursor-pointer items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                                        <span className="text-sm font-medium">{section}</span>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="border-t p-3 text-sm text-muted-foreground">
                                        Content for {section}. Each section operates independently.
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
