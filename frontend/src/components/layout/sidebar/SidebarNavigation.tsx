"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Compass, Home, Library } from "lucide-react";

import { AnimatedLucideIcon, AnimatedMenuText } from "@/components/ui/animated-icon";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarNavigation() {
    const pathname = usePathname();

    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Home">
                            <Link href="/" className="group/item">
                                <AnimatedLucideIcon
                                    icon={Home}
                                    iconClassName="group-hover/item:text-sidebar-accent-foreground group-data-[active=true]/item:text-sidebar-accent-foreground"
                                />
                                <AnimatedMenuText className="text-muted-foreground group-hover/item:text-sidebar-accent-foreground group-data-[active=true]/item:text-sidebar-accent-foreground">
                                    Home
                                </AnimatedMenuText>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === "/explore" || pathname.startsWith("/explore?")}
                            tooltip="Explore"
                        >
                            <Link href="/explore" className="group/item">
                                <AnimatedLucideIcon
                                    icon={Compass}
                                    iconClassName="group-hover/item:text-sidebar-accent-foreground group-data-[active=true]/item:text-sidebar-accent-foreground"
                                />
                                <AnimatedMenuText className="text-muted-foreground group-hover/item:text-sidebar-accent-foreground group-data-[active=true]/item:text-sidebar-accent-foreground">
                                    Explore
                                </AnimatedMenuText>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === "/library" || pathname.startsWith("/library?")}
                            tooltip="Library"
                        >
                            <Link href="/library" className="group/item">
                                <AnimatedLucideIcon
                                    icon={Library}
                                    iconClassName="group-hover/item:text-sidebar-accent-foreground group-data-[active=true]/item:text-sidebar-accent-foreground"
                                />
                                <AnimatedMenuText className="text-muted-foreground group-hover/item:text-sidebar-accent-foreground group-data-[active=true]/item:text-sidebar-accent-foreground">
                                    Library
                                </AnimatedMenuText>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
