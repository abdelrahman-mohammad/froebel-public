"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Shield, User } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const navItems: NavItem[] = [
    {
        href: "/settings",
        label: "Profile",
        icon: User,
        description: "Your public profile info",
    },
    {
        href: "/settings/privacy",
        label: "Privacy",
        icon: Shield,
        description: "Control what others see",
    },
];

export function SettingsNav() {
    const pathname = usePathname();

    return (
        <nav className="space-y-1">
            <h2 className="text-lg font-semibold mb-4 px-3">Settings</h2>
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                            "hover:bg-muted",
                            isActive && "bg-muted font-medium"
                        )}
                    >
                        <Icon
                            className={cn(
                                "h-5 w-5 shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        />
                        <div className="min-w-0">
                            <div className="text-sm">{item.label}</div>
                            <div className="text-xs text-muted-foreground truncate">
                                {item.description}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </nav>
    );
}
