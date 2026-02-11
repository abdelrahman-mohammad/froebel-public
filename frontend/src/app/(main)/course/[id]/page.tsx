"use client";

import { use, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
    ArrowLeft,
    Clock,
    FileText,
    GraduationCap,
    HelpCircle,
    Loader2,
    Users,
} from "lucide-react";

import { DifficultyBadge } from "@/components/course";
import { CourseViewer } from "@/components/course/viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuth } from "@/contexts/AuthContext";

import { useEnrollments } from "@/hooks/useEnrollments";

import { getCourseById, getPublicCourse } from "@/lib/course/api";
import type { CourseDetailDTO, PublicCourseDetailDTO } from "@/lib/course/types";

interface CoursePageProps {
    params: Promise<{ id: string }>;
}

export default function CoursePage({ params }: CoursePageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { enrollments, enroll, isEnrolling } = useEnrollments();

    const [course, setCourse] = useState<PublicCourseDetailDTO | CourseDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if enrolled
    const enrollment = enrollments.find((e) => e.courseId === id);
    const isEnrolled = !!enrollment;

    // Load course data
    useEffect(() => {
        loadCourse();
    }, [id, isAuthenticated, isEnrolled]);

    const loadCourse = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // If enrolled, get full course details; otherwise get public view
            if (isEnrolled) {
                const courseData = await getCourseById(id);
                setCourse(courseData);
            } else {
                const courseData = await getPublicCourse(id);
                setCourse(courseData);
            }
        } catch (err) {
            console.error("Failed to load course:", err);
            setError("Failed to load course. It may not exist or is not public.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/course/${id}`);
            return;
        }

        try {
            await enroll(id);
        } catch (err) {
            console.error("Failed to enroll:", err);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Error state
    if (error || !course) {
        return (
            <div className="container mx-auto py-8 px-4">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
                    <p className="text-muted-foreground max-w-md">
                        {error ||
                            "The course you're looking for doesn't exist or is not available."}
                    </p>
                    <Button
                        onClick={() => router.push("/explore")}
                        className="mt-6"
                        variant="outline"
                    >
                        Browse Courses
                    </Button>
                </div>
            </div>
        );
    }

    // If enrolled, show the course viewer
    if (isEnrolled) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" onClick={() => router.push("/library?type=enrolled")}>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{course.title}</h1>
                        {enrollment && (
                            <p className="text-sm text-muted-foreground">
                                {Math.round(enrollment.progressPercentage)}% complete
                            </p>
                        )}
                    </div>
                </div>

                <CourseViewer courseId={id} />
            </div>
        );
    }

    // Not enrolled - show public course info
    return (
        <div className="container mx-auto py-8 px-4">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div>
                        {course.imageUrl && (
                            <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="w-full h-64 object-cover rounded-lg mb-6"
                            />
                        )}
                        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <DifficultyBadge difficulty={course.difficulty} />
                            <span className="text-muted-foreground">by {course.creatorName}</span>
                        </div>
                        {course.description && (
                            <p className="text-muted-foreground">{course.description}</p>
                        )}
                    </div>

                    {/* Course Materials */}
                    {"materials" in course && course.materials && course.materials.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {course.materials.map((material, index) => (
                                        <li
                                            key={material.id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                                        >
                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="flex-1">{material.title}</span>
                                            {"durationMinutes" in material &&
                                                material.durationMinutes && (
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {material.durationMinutes} min
                                                    </span>
                                                )}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {course.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-8">
                        <CardContent className="pt-6">
                            {/* Stats */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <span>{course.materialCount} materials</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                    <span>{course.quizCount} quizzes</span>
                                </div>
                                {course.estimatedHours && (
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <span>{course.estimatedHours} hours</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <span>{course.enrollmentCount} enrolled</span>
                                </div>
                            </div>

                            {/* Enroll button */}
                            <Button
                                onClick={handleEnroll}
                                disabled={isEnrolling}
                                className="w-full"
                                size="lg"
                            >
                                {isEnrolling ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <GraduationCap className="h-4 w-4" />
                                )}
                                {isAuthenticated ? "Enroll Now" : "Login to Enroll"}
                            </Button>

                            {!isAuthenticated && (
                                <p className="text-sm text-muted-foreground text-center mt-2">
                                    Create an account to track your progress
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
