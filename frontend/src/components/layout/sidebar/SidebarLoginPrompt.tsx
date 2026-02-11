"use client";

import Link from "next/link";

import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarFooter } from "@/components/ui/sidebar";

export function SidebarLoginPrompt() {
    return (
        <SidebarFooter className="border-t !p-0">
            <Button
                asChild
                variant="default"
                size="default"
                className="w-full h-auto py-2.5 rounded-none"
            >
                <Link href="/login" className="gap-3">
                    <div className="flex items-center justify-center size-9 rounded-full bg-primary-foreground/10 shrink-0">
                        <LogIn className="size-4" />
                    </div>
                    <span className="flex-1 text-left transition-all duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-0.5 group-data-[collapsible=icon]:w-0 overflow-hidden">
                        Log in
                    </span>
                </Link>
            </Button>
        </SidebarFooter>
    );
}
