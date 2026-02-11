"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                {/* Navigation skeleton */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[1, 2, 3].map((i) => (
                                <SidebarMenuItem key={i}>
                                    <div className="flex items-center gap-2 px-2 py-1.5">
                                        <Skeleton className="h-4 w-4 shrink-0" />
                                        <Skeleton className="h-4 w-24 group-data-[collapsible=icon]:hidden" />
                                    </div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Starred section skeleton */}
                <SidebarGroup>
                    <div className="px-2 py-1">
                        <Skeleton className="h-3 w-14 group-data-[collapsible=icon]:hidden" />
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[1, 2].map((i) => (
                                <SidebarMenuItem key={i}>
                                    <div className="flex items-center gap-2 px-2 py-1.5">
                                        <Skeleton className="h-4 w-4 shrink-0" />
                                        <Skeleton className="h-4 w-28 group-data-[collapsible=icon]:hidden" />
                                    </div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Courses section skeleton */}
                <SidebarGroup>
                    <div className="px-2 py-1">
                        <Skeleton className="h-3 w-16 group-data-[collapsible=icon]:hidden" />
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[1, 2].map((i) => (
                                <SidebarMenuItem key={i}>
                                    <div className="flex items-center gap-2 px-2 py-1.5">
                                        <Skeleton className="h-4 w-4 shrink-0" />
                                        <Skeleton className="h-4 w-32 group-data-[collapsible=icon]:hidden" />
                                    </div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Recent section skeleton */}
                <SidebarGroup>
                    <div className="px-2 py-1">
                        <Skeleton className="h-3 w-12 group-data-[collapsible=icon]:hidden" />
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[1, 2, 3].map((i) => (
                                <SidebarMenuItem key={i}>
                                    <div className="flex items-center gap-2 px-2 py-1.5">
                                        <Skeleton className="h-4 w-4 shrink-0" />
                                        <Skeleton className="h-4 w-36 group-data-[collapsible=icon]:hidden" />
                                    </div>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t">
                <div className="flex items-center gap-2 p-2">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-32" />
                    </div>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
