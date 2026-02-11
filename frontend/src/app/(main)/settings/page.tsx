"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { AvatarUpload } from "@/components/settings/AvatarUpload";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import * as profileApi from "@/lib/profile/api";
import type { ProfileResponse } from "@/lib/profile/types";

export default function SettingsPage() {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await profileApi.getMyProfile();
                setProfile(data);
            } catch (error) {
                toast.error(profileApi.getProfileErrorMessage(error));
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleProfileUpdate = (updatedProfile: ProfileResponse) => {
        setProfile(updatedProfile);
    };

    if (isLoading) {
        return <SettingsPageSkeleton />;
    }

    if (!profile) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load profile</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your public profile information</p>
            </div>

            {/* Avatar Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                    <CardDescription>Upload a photo to personalize your profile</CardDescription>
                </CardHeader>
                <CardContent>
                    <AvatarUpload
                        currentAvatarUrl={profile.avatarUrl}
                        displayName={profile.displayName}
                        onUpdate={handleProfileUpdate}
                    />
                </CardContent>
            </Card>

            {/* Profile Form Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your name, bio, and social links</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileSettingsForm profile={profile} onUpdate={handleProfileUpdate} />
                </CardContent>
            </Card>
        </div>
    );
}

function SettingsPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-9 w-32" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-56" />
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
