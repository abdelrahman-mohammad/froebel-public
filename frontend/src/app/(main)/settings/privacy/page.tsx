"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { PrivacySettingsForm } from "@/components/settings/PrivacySettingsForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import * as profileApi from "@/lib/profile/api";
import type { ProfileResponse } from "@/lib/profile/types";

export default function PrivacySettingsPage() {
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

    const handlePrivacyUpdate = (updatedProfile: ProfileResponse) => {
        setProfile(updatedProfile);
    };

    if (isLoading) {
        return <PrivacyPageSkeleton />;
    }

    if (!profile) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load settings</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Privacy Settings</h1>
                <p className="text-muted-foreground">
                    Control what information is visible to others
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Visibility</CardTitle>
                    <CardDescription>
                        Choose what information is shown on your public profile
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PrivacySettingsForm privacy={profile.privacy} onUpdate={handlePrivacyUpdate} />
                </CardContent>
            </Card>
        </div>
    );
}

function PrivacyPageSkeleton() {
    return (
        <div className="space-y-6">
            <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-72" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-36 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-7 w-12 rounded-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
