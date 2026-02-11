"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import type { EnrollmentSummaryDTO } from "@/lib/course/types";

import { DashboardSection } from "../DashboardSection";

interface ContinueLearningWidgetProps {
    enrollments: EnrollmentSummaryDTO[];
    className?: string;
}

interface EnrollmentItemProps {
    enrollment: EnrollmentSummaryDTO;
    onContinue: (courseId: string) => void;
}

function EnrollmentItem({ enrollment, onContinue }: EnrollmentItemProps) {
    const { courseId, courseTitle, progressPercentage } = enrollment;

    return (
        <div className="flex items-center gap-4 py-4">
            <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <Link
                    href={`/course/${courseId}`}
                    className="text-sm font-medium hover:underline truncate block"
                >
                    {courseTitle}
                </Link>
                <div className="mt-2 flex items-center gap-3">
                    <Progress value={progressPercentage} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground tabular-nums w-8">
                        {Math.round(progressPercentage)}%
                    </span>
                </div>
            </div>
            <Button
                size="sm"
                variant="outline"
                onClick={() => onContinue(courseId)}
                className="flex-shrink-0"
            >
                Continue
            </Button>
        </div>
    );
}

export function ContinueLearningWidget({ enrollments, className }: ContinueLearningWidgetProps) {
    const router = useRouter();

    const handleContinue = (courseId: string) => {
        router.push(`/course/${courseId}`);
    };

    if (enrollments.length === 0) {
        return null; // Don't show section if empty
    }

    return (
        <DashboardSection
            title="Continue Learning"
            action={{ label: "View all", href: "/library?type=courses" }}
            className={className}
        >
            <div className="divide-y">
                {enrollments.map((enrollment) => (
                    <EnrollmentItem
                        key={enrollment.id}
                        enrollment={enrollment}
                        onContinue={handleContinue}
                    />
                ))}
            </div>
        </DashboardSection>
    );
}
