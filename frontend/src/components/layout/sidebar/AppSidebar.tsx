"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/contexts/AuthContext";

import { useSidebarData } from "@/hooks/useSidebarData";

import { MOCK_USER_PLAN, type SidebarUser } from "@/lib/sidebar";

import { SidebarCourses } from "./SidebarCourses";
import { SidebarLoginPrompt } from "./SidebarLoginPrompt";
import { SidebarNavigation } from "./SidebarNavigation";
import { SidebarRecent } from "./SidebarRecent";
import { SidebarSkeleton } from "./SidebarSkeleton";
import { SidebarStarred } from "./SidebarStarred";
import { SidebarUserProfile } from "./SidebarUserProfile";

/**
 * Clickable spacer that expands the sidebar when collapsed.
 * Fills remaining vertical space below sidebar content.
 */
function SidebarExpandSpacer() {
    const { state, setOpen } = useSidebar();

    const handleClick = () => {
        if (state === "collapsed") {
            setOpen(true);
        }
    };

    return (
        <div
            className="flex-1 min-h-8 cursor-pointer"
            onClick={handleClick}
            aria-label="Expand sidebar"
        />
    );
}

export function AppSidebar() {
    const { user, logout, isAuthenticated, isInitialized } = useAuth();
    const { data, isLoading, starItem, unstarItem, removeRecent, rename } = useSidebarData();

    // Show skeleton while auth is initializing or sidebar data is loading (initial load)
    if (!isInitialized || (isAuthenticated && isLoading && !data)) {
        return <SidebarSkeleton />;
    }

    // Show navigation + login prompt for unauthenticated users
    if (!isAuthenticated || !user) {
        return (
            <Sidebar collapsible="icon">
                <SidebarContent>
                    <SidebarNavigation />
                    <SidebarExpandSpacer />
                </SidebarContent>
                <SidebarLoginPrompt />
                <SidebarRail />
            </Sidebar>
        );
    }

    // Full sidebar for authenticated users
    const sidebarUser: SidebarUser = {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: MOCK_USER_PLAN, // Mock until backend provides plan
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarNavigation />
                <SidebarSeparator className="hidden group-data-[collapsible=icon]:block" />
                <SidebarStarred
                    items={data?.starred ?? []}
                    isLoading={isLoading}
                    onUnstar={unstarItem}
                    onRename={rename}
                />
                <SidebarCourses
                    items={data?.courses ?? []}
                    isLoading={isLoading}
                    onRename={(itemId, newName) => rename(itemId, "course", newName)}
                />
                <SidebarRecent
                    items={data?.recent ?? []}
                    isLoading={isLoading}
                    onStar={starItem}
                    onRemove={removeRecent}
                    onRename={rename}
                />
                <SidebarExpandSpacer />
            </SidebarContent>
            <SidebarFooter className="border-t !p-0">
                <SidebarUserProfile user={sidebarUser} onLogout={logout} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
