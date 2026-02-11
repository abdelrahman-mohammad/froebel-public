"use client";

import { useParams } from "next/navigation";

import { GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function UserCoursesPage() {
    const params = useParams();
    const username = params.username as string;

    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <GraduationCap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Courses Coming Soon</h2>
                <p className="text-muted-foreground max-w-md">
                    @{username}&apos;s public courses will be displayed here once user profiles are
                    fully implemented.
                </p>
            </CardContent>
        </Card>
    );
}
