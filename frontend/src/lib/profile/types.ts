/**
 * Profile API Types
 * TypeScript definitions matching the Profile API specification
 */

// Social links structure
export interface SocialLinks {
    twitter?: string;
    github?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    [key: string]: string | undefined;
}

// Privacy settings
export interface PrivacySettings {
    profilePublic: boolean;
    showEmail: boolean;
    showStats: boolean;
}

// User stats
export interface UserStats {
    quizzesCreated: number;
    coursesCreated: number;
    quizzesTaken?: number;
}

// Full profile response (GET /api/v1/profile/me)
export interface ProfileResponse {
    id: string;
    email: string;
    displayName: string;
    fullName: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    avatarUrl: string | null;
    socialLinks: SocialLinks | null;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    createdAt: string;
    privacy: PrivacySettings;
    stats: UserStats;
}

// Update profile request (PUT /api/v1/profile/me)
export interface UpdateProfileRequest {
    displayName: string;
    fullName?: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
    socialLinks?: SocialLinks | null;
}

// Update privacy request (PUT /api/v1/profile/me/privacy)
export interface UpdatePrivacyRequest {
    profilePublic: boolean;
    showEmail: boolean;
    showStats: boolean;
}

// Public profile response (GET /api/v1/profile/public/{userId})
export interface PublicProfileResponse {
    id: string;
    displayName: string;
    fullName: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    avatarUrl: string | null;
    socialLinks: SocialLinks | null;
    createdAt: string;
    email: string | null;
    stats: UserStats | null;
}

// Profile API error response
export interface ProfileApiErrorResponse {
    error: string;
    message: string;
    details?: Record<string, string>;
}
