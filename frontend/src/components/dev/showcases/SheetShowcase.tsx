"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { ShowcaseItem } from "../ShowcaseItem";

export function SheetShowcase() {
    return (
        <ShowcaseItem title="Sheet" description="Slide-out panel from the edge of the screen">
            <div className="space-y-6">
                {/* Sides */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Slide Direction
                    </h4>
                    <div className="flex flex-wrap gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline">Open Right</Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <SheetHeader>
                                    <SheetTitle>Right Sheet</SheetTitle>
                                    <SheetDescription>
                                        This sheet slides in from the right side.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Sheet content goes here. You can add forms, lists, or any
                                        other content.
                                    </p>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline">Open Left</Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle>Left Sheet</SheetTitle>
                                    <SheetDescription>
                                        This sheet slides in from the left side.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Great for navigation menus or sidebars.
                                    </p>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline">Open Top</Button>
                            </SheetTrigger>
                            <SheetContent side="top">
                                <SheetHeader>
                                    <SheetTitle>Top Sheet</SheetTitle>
                                    <SheetDescription>
                                        This sheet slides in from the top.
                                    </SheetDescription>
                                </SheetHeader>
                            </SheetContent>
                        </Sheet>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline">Open Bottom</Button>
                            </SheetTrigger>
                            <SheetContent side="bottom">
                                <SheetHeader>
                                    <SheetTitle>Bottom Sheet</SheetTitle>
                                    <SheetDescription>
                                        This sheet slides in from the bottom. Great for mobile
                                        interfaces.
                                    </SheetDescription>
                                </SheetHeader>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                {/* With Form */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Form</h4>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button>Edit Profile</Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Edit Profile</SheetTitle>
                                <SheetDescription>
                                    Make changes to your profile here. Click save when you&apos;re
                                    done.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        defaultValue="John Doe"
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="username" className="text-right">
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        defaultValue="@johndoe"
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <SheetFooter>
                                <SheetClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button type="submit">Save changes</Button>
                                </SheetClose>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </ShowcaseItem>
    );
}
