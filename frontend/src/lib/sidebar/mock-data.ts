import type { CourseItem, RecentItem, SidebarData, StarredItem, UserPlan } from "./types";

export const mockStarredItems: StarredItem[] = [
    {
        id: "course-1",
        name: "Introduction to Biology",
        type: "course",
        url: "/courses/intro-biology",
        starredAt: "2024-12-20T10:00:00Z",
    },
    {
        id: "course-2",
        name: "Advanced Mathematics",
        type: "course",
        url: "/courses/advanced-math",
        starredAt: "2024-12-18T14:30:00Z",
    },
    {
        id: "quiz-1",
        name: "Cell Structure Quiz",
        type: "quiz",
        url: "/quiz/cell-structure",
        starredAt: "2024-12-19T09:15:00Z",
        iconUrl: "https://picsum.photos/seed/cell/64/64",
    },
    {
        id: "quiz-2",
        name: "Algebra Fundamentals",
        type: "quiz",
        url: "/quiz/algebra-fundamentals",
        starredAt: "2024-12-17T16:45:00Z",
        iconUrl: "https://picsum.photos/seed/algebra/64/64",
    },
];

export const mockRecentItems: RecentItem[] = [
    {
        id: "quiz-3",
        name: "World History: Ancient Civilizations",
        type: "quiz",
        url: "/quiz/ancient-civilizations",
        lastAccessedAt: "2024-12-24T18:00:00Z",
        iconUrl: "https://picsum.photos/seed/history/64/64",
    },
    {
        id: "quiz-4",
        name: "Chemistry: Periodic Table",
        type: "quiz",
        url: "/quiz/periodic-table",
        lastAccessedAt: "2024-12-24T14:30:00Z",
        iconUrl: "https://picsum.photos/seed/chemistry/64/64",
    },
    {
        id: "quiz-5",
        name: "English Grammar Basics",
        type: "quiz",
        url: "/quiz/grammar-basics",
        lastAccessedAt: "2024-12-23T20:15:00Z",
        // No iconUrl - tests fallback to FileQuestion icon
    },
];

export const mockCourseItems: CourseItem[] = [
    {
        id: "course-1",
        name: "Introduction to Biology",
        url: "/course/intro-biology",
        role: "owner",
    },
    {
        id: "course-2",
        name: "Advanced Mathematics",
        url: "/course/advanced-math",
        role: "owner",
    },
    {
        id: "course-3",
        name: "World History",
        url: "/course/world-history",
        role: "enrolled",
    },
    {
        id: "course-4",
        name: "Physics 101",
        url: "/course/physics-101",
        role: "enrolled",
    },
];

export const mockSidebarData: SidebarData = {
    starred: mockStarredItems,
    recent: mockRecentItems,
    courses: mockCourseItems,
};

// Mock user plan (until backend provides this)
export const MOCK_USER_PLAN: UserPlan = "free";

// Highest plan for comparison
export const HIGHEST_PLAN: UserPlan = "enterprise";
