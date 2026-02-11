"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { ShowcaseItem } from "../ShowcaseItem";

export function SonnerShowcase() {
    return (
        <ShowcaseItem
            title="Toast (Sonner)"
            description="Notification toasts with various types and positions"
        >
            <div className="space-y-6">
                {/* Basic Types */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Toast Types</h4>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={() => toast("Default toast message")}>
                            Default
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.success("Successfully saved!")}
                        >
                            Success
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.error("Something went wrong")}
                        >
                            Error
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.warning("Please review your input")}
                        >
                            Warning
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => toast.info("New update available")}
                        >
                            Info
                        </Button>
                    </div>
                </div>

                {/* With Description */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        With Description
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.success("Changes saved", {
                                    description: "Your profile has been updated successfully.",
                                })
                            }
                        >
                            Success + Description
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.error("Upload failed", {
                                    description: "The file size exceeds the 5MB limit.",
                                })
                            }
                        >
                            Error + Description
                        </Button>
                    </div>
                </div>

                {/* With Action */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Action</h4>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast("Item deleted", {
                                    description: "The item has been moved to trash.",
                                    action: {
                                        label: "Undo",
                                        onClick: () => toast.success("Restored!"),
                                    },
                                })
                            }
                        >
                            With Undo Action
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast.info("New version available", {
                                    description: "Version 2.0 is ready to install.",
                                    action: {
                                        label: "Update",
                                        onClick: () => toast.success("Updating..."),
                                    },
                                })
                            }
                        >
                            With Update Action
                        </Button>
                    </div>
                </div>

                {/* Loading Toast */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Loading State
                    </h4>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const toastId = toast.loading("Saving changes...");
                            setTimeout(() => {
                                toast.success("Changes saved!", {
                                    id: toastId,
                                });
                            }, 2000);
                        }}
                    >
                        Loading → Success
                    </Button>
                </div>

                {/* Promise Toast */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Promise Toast
                    </h4>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const promise = new Promise<{ name: string }>((resolve) =>
                                setTimeout(() => resolve({ name: "Quiz" }), 2000)
                            );

                            toast.promise(promise, {
                                loading: "Creating quiz...",
                                success: (data) => `${data.name} created successfully!`,
                                error: "Failed to create quiz",
                            });
                        }}
                    >
                        Promise Toast
                    </Button>
                </div>

                {/* Custom Duration */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Custom Duration
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast("Quick toast (1s)", {
                                    duration: 1000,
                                })
                            }
                        >
                            1 Second
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast("Long toast (10s)", {
                                    duration: 10000,
                                })
                            }
                        >
                            10 Seconds
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                toast("Persistent toast", {
                                    duration: Infinity,
                                    action: {
                                        label: "Dismiss",
                                        onClick: () => {},
                                    },
                                })
                            }
                        >
                            Persistent
                        </Button>
                    </div>
                </div>

                {/* Dismiss All */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Controls</h4>
                    <Button variant="destructive" onClick={() => toast.dismiss()}>
                        Dismiss All Toasts
                    </Button>
                </div>
            </div>
        </ShowcaseItem>
    );
}
