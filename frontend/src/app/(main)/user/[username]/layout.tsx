"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { usePathname } from "next/navigation";

import { FileText, GraduationCap, User, Users } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProfileLayoutProps {
    children: React.ReactNode;
}

const profileTabs = [
    { href: "", label: "Profile", icon: User },
    { href: "/quizzes", label: "Quizzes", icon: FileText },
    { href: "/courses", label: "Courses", icon: GraduationCap },
    { href: "/followers", label: "Followers", icon: Users },
    { href: "/following", label: "Following", icon: Users },
];

export default function ProfileLayout({ children }: ProfileLayoutProps) {
    const params = useParams();
    const pathname = usePathname();
    const username = params.username as string;
    const basePath = `/user/${username}`;

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Profile Header Placeholder */}
            <div className="mb-8 p-6 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">@{username}</h1>
                        <p className="text-muted-foreground">User profile coming soon</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex gap-1 border-b mb-6">
                {profileTabs.map((tab) => {
                    const href = `${basePath}${tab.href}`;
                    const isActive =
                        tab.href === "" ? pathname === basePath : pathname.startsWith(href);

                    return (
                        <Link
                            key={tab.href}
                            href={href}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                                isActive
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Page Content */}
            {children}
        </div>
    );
}
