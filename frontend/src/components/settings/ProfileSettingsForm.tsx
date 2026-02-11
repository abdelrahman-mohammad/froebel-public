"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Linkedin, Twitter } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormError, FormGroup, FormHint } from "@/components/ui/form-group";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import * as profileApi from "@/lib/profile/api";
import type { ProfileResponse } from "@/lib/profile/types";
import { type ProfileFormData, profileSchema } from "@/lib/profile/validation";

interface ProfileSettingsFormProps {
    profile: ProfileResponse;
    onUpdate: (profile: ProfileResponse) => void;
}

export function ProfileSettingsForm({ profile, onUpdate }: ProfileSettingsFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: profile.displayName,
            fullName: profile.fullName || "",
            bio: profile.bio || "",
            location: profile.location || "",
            website: profile.website || "",
            socialLinks: {
                twitter: profile.socialLinks?.twitter || "",
                github: profile.socialLinks?.github || "",
                linkedin: profile.socialLinks?.linkedin || "",
            },
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);
        try {
            const updatedProfile = await profileApi.updateProfile({
                displayName: data.displayName,
                fullName: data.fullName || null,
                bio: data.bio || null,
                location: data.location || null,
                website: data.website || null,
                socialLinks: data.socialLinks || null,
            });
            onUpdate(updatedProfile);
            reset(data); // Reset form state to mark as not dirty
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(profileApi.getProfileErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
                <FormGroup label="Display Name" htmlFor="displayName" required spacing="none">
                    <Input
                        id="displayName"
                        placeholder="How others will see your name"
                        aria-invalid={!!errors.displayName}
                        {...register("displayName")}
                    />
                    {errors.displayName && <FormError>{errors.displayName.message}</FormError>}
                    <FormHint>2-50 characters</FormHint>
                </FormGroup>

                <FormGroup label="Full Name" htmlFor="fullName" spacing="none">
                    <Input
                        id="fullName"
                        placeholder="Your full legal name (optional)"
                        aria-invalid={!!errors.fullName}
                        {...register("fullName")}
                    />
                    {errors.fullName && <FormError>{errors.fullName.message}</FormError>}
                </FormGroup>
            </div>

            <FormGroup label="Bio" htmlFor="bio" spacing="none">
                <Textarea
                    id="bio"
                    placeholder="Tell others about yourself..."
                    className="min-h-[100px]"
                    aria-invalid={!!errors.bio}
                    {...register("bio")}
                />
                {errors.bio && <FormError>{errors.bio.message}</FormError>}
                <FormHint>Up to 500 characters</FormHint>
            </FormGroup>

            <div className="grid gap-4 md:grid-cols-2">
                <FormGroup label="Location" htmlFor="location" spacing="none">
                    <Input
                        id="location"
                        placeholder="City, Country"
                        aria-invalid={!!errors.location}
                        {...register("location")}
                    />
                    {errors.location && <FormError>{errors.location.message}</FormError>}
                </FormGroup>

                <FormGroup label="Website" htmlFor="website" spacing="none">
                    <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        aria-invalid={!!errors.website}
                        {...register("website")}
                    />
                    {errors.website && <FormError>{errors.website.message}</FormError>}
                </FormGroup>
            </div>

            <Separator />

            {/* Social Links */}
            <div>
                <h3 className="text-sm font-semibold mb-4">Social Links</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <FormGroup label="Twitter" htmlFor="twitter" spacing="none">
                        <div className="relative">
                            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="twitter"
                                placeholder="username"
                                className="pl-10"
                                {...register("socialLinks.twitter")}
                            />
                        </div>
                    </FormGroup>

                    <FormGroup label="GitHub" htmlFor="github" spacing="none">
                        <div className="relative">
                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="github"
                                placeholder="username"
                                className="pl-10"
                                {...register("socialLinks.github")}
                            />
                        </div>
                    </FormGroup>

                    <FormGroup label="LinkedIn" htmlFor="linkedin" spacing="none">
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="linkedin"
                                placeholder="username"
                                className="pl-10"
                                {...register("socialLinks.linkedin")}
                            />
                        </div>
                    </FormGroup>
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => reset()}
                    disabled={!isDirty || isSubmitting}
                >
                    Cancel
                </Button>
                <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
