import { mockSidebarData } from "./mock-data";
import type { SidebarData } from "./types";

// API base URL for future use
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Get CSRF token from cookie (XSRF-TOKEN)
 * Spring Security sets this cookie for CSRF protection
 */
function getCsrfToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Helper to make API requests with credentials (cookies)
 * CSRF token is included in X-XSRF-TOKEN header for state-changing requests
 */
async function fetchWithCredentials(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Include CSRF token for state-changing methods (POST, PUT, DELETE)
    const method = options.method?.toUpperCase() || "GET";
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            (headers as Record<string, string>)["X-XSRF-TOKEN"] = csrfToken;
        }
    }

    return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include",
    });
}

/**
 * Fetches sidebar data (starred items and recent quizzes)
 * Currently returns mock data - replace with actual API call when ready
 */
export async function fetchSidebarData(): Promise<SidebarData> {
    // TODO: Replace with actual API call when backend is ready
    // const response = await fetchWithCredentials('/api/v1/user/sidebar');
    //
    // if (!response.ok) {
    //   throw new Error('Failed to fetch sidebar data');
    // }
    //
    // return response.json();

    // For now, simulate API delay and return mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockSidebarData;
}

/**
 * Stars/unstars an item
 */
export async function toggleStarItem(itemId: string, itemType: "quiz" | "course"): Promise<void> {
    // TODO: Implement when backend is ready
    // await fetchWithCredentials(`/api/v1/user/starred/${itemType}/${itemId}`, { method: 'POST' });
    console.log(`Toggle star for ${itemType} ${itemId}`);
}

/**
 * Records that a quiz was accessed (for recent items)
 */
export async function recordQuizAccess(quizId: string): Promise<void> {
    // TODO: Implement when backend is ready
    // await fetchWithCredentials(`/api/v1/user/recent/quiz/${quizId}`, { method: 'POST' });
    console.log(`Record access for quiz ${quizId}`);
}

/**
 * Removes an item from the recent list
 */
export async function removeFromRecent(itemId: string, itemType: "quiz" | "course"): Promise<void> {
    // TODO: Implement when backend is ready
    // await fetchWithCredentials(`/api/v1/user/recent/${itemType}/${itemId}`, { method: 'DELETE' });
    console.log(`Remove ${itemType} ${itemId} from recent`);
}

/**
 * Renames a quiz or course
 */
export async function renameItem(itemId: string, itemType: "quiz" | "course", newName: string): Promise<void> {
    // TODO: Implement when backend is ready
    // await fetchWithCredentials(`/api/v1/${itemType}s/${itemId}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify({ name: newName }),
    // });
    console.log(`Rename ${itemType} ${itemId} to "${newName}"`);
}
