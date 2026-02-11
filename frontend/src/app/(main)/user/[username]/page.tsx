"use client";

import { useParams } from "next/navigation";

import { Calendar, Construction, Link as LinkIcon, MapPin, User } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserProfilePage() {
    const params = useParams();
    const username = params.username as string;

    return (
        <div className="space-y-6">
            {/* Coming Soon Notice */}
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Construction className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Profile Coming Soon</h2>
                    <p className="text-muted-foreground max-w-md">
                        User profiles are under development. Soon you&apos;ll be able to see @
                        {username}&apos;s bio, stats, and public content here.
                    </p>
                </CardContent>
            </Card>

            {/* Placeholder Profile Info */}
            <Card>
                <CardHeader>
                    <CardTitle>About</CardTitle>
                    <CardDescription>User information will appear here</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Display name not set</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined date unavailable</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Location not set</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <LinkIcon className="h-4 w-4" />
                        <span>Website not set</span>
                    </div>
                </CardContent>
            </Card>

            {/* Placeholder Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-sm text-muted-foreground">Quizzes Created</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-sm text-muted-foreground">Courses Created</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-sm text-muted-foreground">Followers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-sm text-muted-foreground">Following</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
