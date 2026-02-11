"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { ShowcaseItem } from "../ShowcaseItem";

export function DialogShowcase() {
    return (
        <ShowcaseItem
            title="Dialog"
            description="Modal dialog for forms, content, and user interactions"
        >
            <div className="space-y-6">
                {/* Default */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Default</h4>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">Open Dialog</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>
                                    Make changes to your profile here. Click save when you&apos;re
                                    done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" defaultValue="Pedro Duarte" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" defaultValue="@peduarte" />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Size Variants via className */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Size Variants
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Small (sm:max-w-sm)
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                                <DialogHeader>
                                    <DialogTitle>Small Dialog</DialogTitle>
                                    <DialogDescription>
                                        This is a small dialog using sm:max-w-sm class.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button>Got it</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Medium (sm:max-w-md)
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Medium Dialog</DialogTitle>
                                    <DialogDescription>
                                        This dialog uses sm:max-w-md for medium width.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button>Confirm</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Large (sm:max-w-xl)
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Large Dialog</DialogTitle>
                                    <DialogDescription>
                                        This dialog uses sm:max-w-xl for larger content like forms.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <p className="text-sm text-muted-foreground">
                                        Perfect for forms with more fields or content that needs
                                        more horizontal space.
                                    </p>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button>Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Without Close Button */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Without Close Button
                    </h4>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                No Close Button
                            </Button>
                        </DialogTrigger>
                        <DialogContent showCloseButton={false}>
                            <DialogHeader>
                                <DialogTitle>No Close Button</DialogTitle>
                                <DialogDescription>
                                    This dialog has no X button. Users must use the footer buttons
                                    or press Escape.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button>Got it</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Accessibility Notes */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h4 className="text-sm font-medium mb-2">Dialog vs AlertDialog</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                            • <strong>Dialog:</strong> Dismissable by clicking outside, Escape key,
                            or close button
                        </li>
                        <li>
                            • <strong>AlertDialog:</strong> Requires explicit action
                            (Cancel/Continue)
                        </li>
                        <li>
                            • Use <strong>Dialog</strong> for forms, settings, content viewing
                        </li>
                        <li>
                            • Use <strong>AlertDialog</strong> for confirmations, destructive
                            actions
                        </li>
                    </ul>
                </div>
            </div>
        </ShowcaseItem>
    );
}
