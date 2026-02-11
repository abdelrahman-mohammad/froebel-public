/**
 * Tags API Client
 * Fetch wrappers for tag endpoints
 */

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ============================================
// Types
// ============================================

export interface TagDTO {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
    icon?: string | null;
    usageCount: number;
    createdAt?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Fetch all available tags
 */
export async function getTags(): Promise<TagDTO[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/tags`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get a single tag by ID
 */
export async function getTagById(tagId: string): Promise<TagDTO> {
    const response = await fetch(`${API_BASE_URL}/api/v1/tags/${tagId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tag: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get a single tag by slug
 */
export async function getTagBySlug(slug: string): Promise<TagDTO> {
    const response = await fetch(`${API_BASE_URL}/api/v1/tags/slug/${slug}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tag: ${response.statusText}`);
    }

    return response.json();
}
