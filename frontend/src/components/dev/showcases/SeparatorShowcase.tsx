"use client";

import { Separator } from "@/components/ui/separator";

import { ShowcaseItem } from "../ShowcaseItem";

export function SeparatorShowcase() {
    return (
        <ShowcaseItem title="Separator" description="Visual divider between content sections">
            <div className="space-y-6">
                {/* Horizontal */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Horizontal</h4>
                    <div className="space-y-4 w-full max-w-md">
                        <div>
                            <h4 className="text-sm font-medium">Section One</h4>
                            <p className="text-sm text-muted-foreground">
                                Content for section one.
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="text-sm font-medium">Section Two</h4>
                            <p className="text-sm text-muted-foreground">
                                Content for section two.
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <h4 className="text-sm font-medium">Section Three</h4>
                            <p className="text-sm text-muted-foreground">
                                Content for section three.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Vertical */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Vertical</h4>
                    <div className="flex h-5 items-center space-x-4 text-sm">
                        <div>Blog</div>
                        <Separator orientation="vertical" />
                        <div>Docs</div>
                        <Separator orientation="vertical" />
                        <div>Source</div>
                        <Separator orientation="vertical" />
                        <div>Changelog</div>
                    </div>
                </div>

                {/* With Text */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Inline with Text
                    </h4>
                    <div className="flex items-center gap-4 w-full max-w-md">
                        <Separator className="flex-1" />
                        <span className="text-sm text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                    </div>
                </div>

                {/* Profile Example */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Profile Layout
                    </h4>
                    <div className="w-full max-w-sm">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
                            <p className="text-sm text-muted-foreground">
                                An open-source UI component library.
                            </p>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex h-5 items-center space-x-4 text-sm">
                            <div>Blog</div>
                            <Separator orientation="vertical" />
                            <div>Docs</div>
                            <Separator orientation="vertical" />
                            <div>Source</div>
                        </div>
                    </div>
                </div>

                {/* Custom Styling */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Custom Styling
                    </h4>
                    <div className="space-y-4 w-full max-w-md">
                        <Separator className="bg-primary" />
                        <Separator className="bg-destructive" />
                        <Separator className="bg-success" />
                        <Separator className="h-[2px] bg-gradient-to-r from-primary via-destructive to-success" />
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
