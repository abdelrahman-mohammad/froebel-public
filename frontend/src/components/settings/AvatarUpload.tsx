"use client";

import { useRef, useState } from "react";

import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import * as profileApi from "@/lib/profile/api";
import type { ProfileResponse } from "@/lib/profile/types";
import { validateAvatarFile } from "@/lib/profile/validation";

interface AvatarUploadProps {
    currentAvatarUrl: string | null;
    displayName: string;
    onUpdate: (profile: ProfileResponse) => void;
}

export function AvatarUpload({ currentAvatarUrl, displayName, onUpdate }: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initials = displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const avatarUrl = previewUrl || profileApi.getAvatarUrl(currentAvatarUrl);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const error = validateAvatarFile(file);
        if (error) {
            toast.error(error);
            return;
        }

        // Show preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Upload
        setIsUploading(true);
        try {
            const updatedProfile = await profileApi.uploadAvatar(file);
            onUpdate(updatedProfile);
            toast.success("Avatar updated successfully");
        } catch (error) {
            toast.error(profileApi.getProfileErrorMessage(error));
            setPreviewUrl(null); // Revert preview on error
        } finally {
            setIsUploading(false);
            URL.revokeObjectURL(objectUrl);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const updatedProfile = await profileApi.deleteAvatar();
            onUpdate(updatedProfile);
            setPreviewUrl(null);
            toast.success("Avatar removed");
        } catch (error) {
            toast.error(profileApi.getProfileErrorMessage(error));
        } finally {
            setIsDeleting(false);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading || isDeleting}
                />

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={openFileDialog}
                    disabled={isUploading || isDeleting}
                >
                    <Camera className="h-4 w-4" />
                    {currentAvatarUrl ? "Change Photo" : "Upload Photo"}
                </Button>

                {currentAvatarUrl && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={isUploading || isDeleting}
                                className="text-destructive hover:text-destructive"
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Remove
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove profile photo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Your profile photo will be removed and replaced with your
                                    initials.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF. Max 5MB.</p>
            </div>
        </div>
    );
}
