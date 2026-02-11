"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { GraduationCap, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { CourseSummaryDTO } from "@/lib/course/types";

import { DashboardSection } from "../DashboardSection";
import { EmptyState } from "../EmptyState";

interface RecentCoursesWidgetProps {
    courses: CourseSummaryDTO[];
    className?: string;
}

interface CourseItemProps {
    course: CourseSummaryDTO;
    onManage: (courseId: string) => void;
}

function CourseItem({ course, onManage }: CourseItemProps) {
    return (
        <div className="flex items-center gap-4 py-4">
            <GraduationCap className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <Link
                    href={`/course/${course.id}/edit`}
                    className="text-sm font-medium hover:underline truncate block"
                >
                    {course.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {course.materialCount} {course.materialCount === 1 ? "material" : "materials"} ·{" "}
                    {course.enrollmentCount} {course.enrollmentCount === 1 ? "student" : "students"}
                </p>
            </div>
            <Badge variant={course.published ? "default" : "secondary"} className="flex-shrink-0">
                {course.published ? "Published" : "Draft"}
            </Badge>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => onManage(course.id)}
                className="flex-shrink-0"
            >
                <Settings className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function RecentCoursesWidget({ courses, className }: RecentCoursesWidgetProps) {
    const router = useRouter();

    const handleManage = (courseId: string) => {
        router.push(`/course/${courseId}/edit`);
    };

    return (
        <DashboardSection
            title="My Courses"
            action={
                courses.length > 0
                    ? { label: "View all", href: "/library?type=courses" }
                    : undefined
            }
            className={className}
        >
            {courses.length === 0 ? (
                <EmptyState
                    icon={GraduationCap}
                    title="No courses yet"
                    description="Create your first course to get started"
                    action={{ label: "Create course", href: "/course/new" }}
                    className="py-4"
                />
            ) : (
                <div className="divide-y">
                    {courses.map((course) => (
                        <CourseItem key={course.id} course={course} onManage={handleManage} />
                    ))}
                </div>
            )}
        </DashboardSection>
    );
}
