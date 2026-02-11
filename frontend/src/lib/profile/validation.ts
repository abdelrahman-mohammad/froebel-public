/**
 * Zod validation schemas for profile forms
 * Based on PROFILE_API.md validation rules
 */
import { z } from "zod";

// Display name: 2-50 chars, required
const displayNameSchema = z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be at most 50 characters");

// Full name: 0-100 chars, optional
const fullNameSchema = z.string().max(100, "Full name must be at most 100 characters");

// Bio: 0-500 chars, optional
const bioSchema = z.string().max(500, "Bio must be at most 500 characters");

// Location: 0-100 chars, optional
const locationSchema = z.string().max(100, "Location must be at most 100 characters");

// Website: valid URL, 0-500 chars, optional
const websiteSchema = z
    .string()
    .max(500, "Website URL must be at most 500 characters")
    .refine(
        (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
        "Website must be a valid URL starting with http:// or https://"
    );

// Social link handle (username, not full URL)
const socialHandleSchema = z.string().max(100, "Social handle must be at most 100 characters");

// Social links object
const socialLinksSchema = z.object({
    twitter: socialHandleSchema,
    github: socialHandleSchema,
    linkedin: socialHandleSchema,
});

/**
 * Profile update form schema
 */
export const profileSchema = z.object({
    displayName: displayNameSchema,
    fullName: fullNameSchema,
    bio: bioSchema,
    location: locationSchema,
    website: websiteSchema,
    socialLinks: socialLinksSchema,
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * Privacy settings schema
 */
export const privacySchema = z.object({
    profilePublic: z.boolean(),
    showEmail: z.boolean(),
    showStats: z.boolean(),
});

export type PrivacyFormData = z.infer<typeof privacySchema>;

/**
 * Avatar file validation
 */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateAvatarFile(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return "Please upload a JPEG, PNG, WebP, or GIF image";
    }
    if (file.size > MAX_FILE_SIZE) {
        return "File size must be less than 5MB";
    }
    return null;
}
