"use client";

import { HelpCircle } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] p-8">
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <HelpCircle className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Help</h1>
                <p className="text-muted-foreground">
                    Get help and support for using Froebel. This page is under construction.
                </p>
            </div>
        </div>
    );
}
