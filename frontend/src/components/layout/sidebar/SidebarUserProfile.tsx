"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useTheme } from "next-themes";

import { ChevronsUpDown, Crown, Globe, HelpCircle, LogOut, Monitor, Moon, Settings, Sparkles, Sun } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { SidebarUser } from "@/lib/sidebar";
import { HIGHEST_PLAN } from "@/lib/sidebar";

interface SidebarUserProfileProps {
    user: SidebarUser | null;
    onLogout: () => void;
}

function getPlanDisplayName(plan: string): string {
    switch (plan) {
        case "free":
            return "Free Plan";
        case "pro":
            return "Pro Plan";
        case "enterprise":
            return "Enterprise Plan";
        default:
            return "Free Plan";
    }
}

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "de", label: "Deutsch" },
    { code: "ar", label: "العربية" },
] as const;

const THEMES = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
] as const;

export function SidebarUserProfile({ user, onLogout }: SidebarUserProfileProps) {
    const [language, setLanguage] = useState("en");
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!user) {
        return null;
    }

    const isOnHighestPlan = user.plan === HIGHEST_PLAN;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-none px-2 py-2.5 transition-colors duration-75 hover:bg-sidebar-accent active:bg-sidebar-accent data-[state=open]:bg-sidebar-accent group/profile"
                >
                    <div className="relative shrink-0">
                        <div className="flex items-center justify-center rounded-lg border-0.5 border-transparent transition group-hover/profile:border-sidebar-border group-hover/profile:opacity-90">
                            <Avatar className="h-9 w-9 rounded-lg">
                                <AvatarImage
                                    src={user.avatarUrl || undefined}
                                    alt={user.displayName}
                                />
                                <AvatarFallback className="rounded-lg text-base font-bold">
                                    {getInitials(user.displayName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                    <div className="flex flex-1 items-center justify-between min-w-0 overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:-translate-x-0.5 group-data-[collapsible=icon]:w-0">
                        <div className="flex flex-col items-start min-w-0 flex-1 pr-1 text-left">
                            <span className="w-full truncate text-sm font-medium">
                                {user.displayName}
                            </span>
                            <span className="w-full truncate text-xs text-muted-foreground">
                                {getPlanDisplayName(user.plan)}
                            </span>
                        </div>
                        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="top"
                align="start"
                sideOffset={4}
            >
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/settings">
                            <Settings />
                            <span className="flex-1">Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Globe />
                            <span className="flex-1">Language</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {LANGUAGES.map((lang) => (
                                <DropdownMenuCheckboxItem
                                    key={lang.code}
                                    checked={language === lang.code}
                                    onCheckedChange={() => setLanguage(lang.code)}
                                >
                                    <span className="flex-1">{lang.label}</span>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            {mounted ? (
                                theme === "dark" ? <Moon /> : theme === "light" ? <Sun /> : <Monitor />
                            ) : (
                                <Sun />
                            )}
                            <span className="flex-1">Theme</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {THEMES.map((t) => (
                                <DropdownMenuCheckboxItem
                                    key={t.value}
                                    checked={mounted && theme === t.value}
                                    onCheckedChange={() => setTheme(t.value)}
                                >
                                    <t.icon className="mr-2 h-4 w-4" />
                                    <span className="flex-1">{t.label}</span>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuItem asChild>
                        <Link href="/help">
                            <HelpCircle />
                            <span className="flex-1">Help</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {isOnHighestPlan ? (
                        <DropdownMenuItem disabled>
                            <Crown className="!text-yellow-500" />
                            <span className="flex-1">You&apos;re on the best plan!</span>
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem asChild>
                            <Link href="/upgrade">
                                <Sparkles />
                                <span className="flex-1">Upgrade Plan</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} variant="destructive">
                    <LogOut />
                    <span className="flex-1">Logout</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
