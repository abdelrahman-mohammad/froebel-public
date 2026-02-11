export type SidebarItemType = "quiz" | "course";
export type UserPlan = "free" | "pro" | "enterprise";

export interface SidebarItem {
    id: string;
    name: string;
    type: SidebarItemType;
    url: string;
    iconUrl?: string; // Quiz icon image URL
}

export interface StarredItem extends SidebarItem {
    starredAt: string;
}

export interface RecentItem extends SidebarItem {
    lastAccessedAt: string;
}

export interface CourseItem {
    id: string;
    name: string;
    url: string;
    role: "owner" | "enrolled";
}

export interface SidebarData {
    starred: StarredItem[];
    recent: RecentItem[];
    courses: CourseItem[];
}

export interface SidebarUser {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    plan: UserPlan;
}
