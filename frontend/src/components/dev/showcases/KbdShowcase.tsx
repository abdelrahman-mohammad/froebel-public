"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";

import { Kbd } from "@/components/ui/kbd";

import { ShowcaseItem } from "../ShowcaseItem";

export function KbdShowcase() {
    return (
        <ShowcaseItem title="Kbd" description="Keyboard key indicator for shortcuts and commands">
            <div className="space-y-6">
                {/* Single Keys */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Single Keys</h4>
                    <div className="flex flex-wrap gap-2">
                        <Kbd>K</Kbd>
                        <Kbd>Enter</Kbd>
                        <Kbd>Esc</Kbd>
                        <Kbd>Tab</Kbd>
                        <Kbd>Space</Kbd>
                    </div>
                </div>

                {/* Modifier Keys */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Modifier Keys
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        <Kbd>Ctrl</Kbd>
                        <Kbd>Shift</Kbd>
                        <Kbd>Alt</Kbd>
                        <Kbd>Cmd</Kbd>
                    </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Keyboard Shortcuts
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1">
                            <Kbd>Ctrl</Kbd>
                            <span className="text-muted-foreground">+</span>
                            <Kbd>K</Kbd>
                            <span className="text-sm text-muted-foreground">Search</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Kbd>Ctrl</Kbd>
                            <span className="text-muted-foreground">+</span>
                            <Kbd>S</Kbd>
                            <span className="text-sm text-muted-foreground">Save</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Kbd>Ctrl</Kbd>
                            <span className="text-muted-foreground">+</span>
                            <Kbd>Shift</Kbd>
                            <span className="text-muted-foreground">+</span>
                            <Kbd>P</Kbd>
                            <span className="text-sm text-muted-foreground">Command palette</span>
                        </div>
                    </div>
                </div>

                {/* Arrow Keys */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Arrow Keys</h4>
                    <div className="flex flex-wrap gap-2">
                        <Kbd>
                            <ArrowLeft className="size-3" strokeWidth={3} />
                        </Kbd>
                        <Kbd>
                            <ArrowUp className="size-3" strokeWidth={3} />
                        </Kbd>
                        <Kbd>
                            <ArrowDown className="size-3" strokeWidth={3} />
                        </Kbd>
                        <Kbd>
                            <ArrowRight className="size-3" strokeWidth={3} />
                        </Kbd>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
