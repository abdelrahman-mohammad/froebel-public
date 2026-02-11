"use client";

import { useState } from "react";

import { BarChart2, Globe, Mail } from "lucide-react";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import * as profileApi from "@/lib/profile/api";
import type { PrivacySettings, ProfileResponse } from "@/lib/profile/types";

interface PrivacySetting {
    key: keyof PrivacySettings;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const privacySettings: PrivacySetting[] = [
    {
        key: "profilePublic",
        label: "Public Profile",
        description: "Allow anyone to view your profile page",
        icon: Globe,
    },
    {
        key: "showEmail",
        label: "Show Email Address",
        description: "Display your email on your public profile",
        icon: Mail,
    },
    {
        key: "showStats",
        label: "Show Statistics",
        description: "Display quiz and course statistics on your profile",
        icon: BarChart2,
    },
];

interface PrivacySettingsFormProps {
    privacy: PrivacySettings;
    onUpdate: (profile: ProfileResponse) => void;
}

export function PrivacySettingsForm({ privacy, onUpdate }: PrivacySettingsFormProps) {
    const [settings, setSettings] = useState<PrivacySettings>(privacy);
    const [updating, setUpdating] = useState<keyof PrivacySettings | null>(null);

    const handleToggle = async (key: keyof PrivacySettings, value: boolean) => {
        const previousSettings = { ...settings };

        // Optimistic update
        setSettings((prev) => ({ ...prev, [key]: value }));
        setUpdating(key);

        try {
            const updatedProfile = await profileApi.updatePrivacy({
                ...settings,
                [key]: value,
            });
            onUpdate(updatedProfile);
            toast.success("Privacy settings updated");
        } catch (error) {
            // Revert on error
            setSettings(previousSettings);
            toast.error(profileApi.getProfileErrorMessage(error));
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            {privacySettings.map((setting) => {
                const Icon = setting.icon;
                const isChecked = settings[setting.key];
                const isUpdating = updating === setting.key;

                return (
                    <div key={setting.key} className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="space-y-0.5">
                                <Label
                                    htmlFor={setting.key}
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    {setting.label}
                                </Label>
                                <p
                                    id={`${setting.key}-description`}
                                    className="text-xs text-muted-foreground"
                                >
                                    {setting.description}
                                </p>
                            </div>
                        </div>
                        <Switch
                            id={setting.key}
                            checked={isChecked}
                            onCheckedChange={(value) => handleToggle(setting.key, value)}
                            disabled={isUpdating}
                            aria-describedby={`${setting.key}-description`}
                        />
                    </div>
                );
            })}

            {/* Privacy notice */}
            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>
                    <strong>Note:</strong> When your profile is private, only you can see your
                    profile page. Your display name and avatar will still appear on quizzes and
                    courses you create.
                </p>
            </div>
        </div>
    );
}
