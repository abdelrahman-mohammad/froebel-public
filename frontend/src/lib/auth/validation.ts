/**
 * Zod validation schemas for authentication forms
 * Based on AUTH_API.md validation rules
 */
import { z } from "zod";

// Password validation:
// - 8-100 characters
// - Must contain uppercase letter
// - Must contain lowercase letter
// - Must contain number
const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number");

// Email validation
const emailSchema = z.string().min(1, "Email is required").email("Invalid email format");

// Display name validation: 2-50 characters
const displayNameSchema = z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be at most 50 characters");

/**
 * Login form schema
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form schema
 */
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    displayName: displayNameSchema,
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Forgot password form schema
 */
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password form schema
 */
export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordSchema,
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Change password form schema
 */
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Password requirements for display
 */
export const PASSWORD_REQUIREMENTS = [
    "At least 8 characters",
    "At least one uppercase letter",
    "At least one lowercase letter",
    "At least one number",
] as const;
