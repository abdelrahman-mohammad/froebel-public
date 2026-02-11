"use client";

import Image from "next/image";
import Link from "next/link";

import { BookOpen, CheckCircle2, Play, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import type { EnrollmentSummaryDTO } from "@/lib/course/types";

interface EnrollmentCardProps {
    enrollment: EnrollmentSummaryDTO;
    onContinue?: (courseId: string) => void;
    onUnenroll?: (courseId: string) => void;
}

export function EnrollmentCard({ enrollment, onContinue, onUnenroll }: EnrollmentCardProps) {
    const {
        courseId,
        courseTitle,
        courseImageUrl,
        progressPercentage,
        completedMaterialCount,
        materialCount,
        completedAt,
    } = enrollment;

    const isCompleted = completedAt !== null && completedAt !== undefined;
    const progressVariant = isCompleted
        ? "success"
        : progressPercentage >= 50
          ? "default"
          : "default";

    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
                {/* Course Image */}
                {courseImageUrl && (
                    <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-muted flex-shrink-0">
                        <Image
                            src={courseImageUrl}
                            alt={courseTitle}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 192px"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 flex flex-col p-4 sm:p-6">
                    <CardHeader className="p-0 mb-4">
                        <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg line-clamp-2">{courseTitle}</CardTitle>
                            {isCompleted && (
                                <Badge
                                    variant="secondary"
                                    className="bg-emerald-100 text-emerald-700 flex-shrink-0"
                                >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                </Badge>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 flex-1">
                        {/* Progress */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-muted-foreground">
                                    {completedMaterialCount} of {materialCount} materials completed
                                </span>
                                <span className="font-medium">
                                    {Math.round(progressPercentage)}%
                                </span>
                            </div>
                            <Progress value={progressPercentage} variant={progressVariant} />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>
                                {materialCount - completedMaterialCount} materials remaining
                            </span>
                        </div>
                    </CardContent>

                    <CardFooter className="p-0 pt-4 flex gap-2">
                        <Button
                            onClick={() => onContinue?.(courseId)}
                            className="flex-1 sm:flex-none"
                        >
                            <Play className="h-4 w-4" />
                            {isCompleted ? "Review" : "Continue"}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onUnenroll?.(courseId)}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Unenroll</span>
                        </Button>
                    </CardFooter>
                </div>
            </div>
        </Card>
    );
}

export default EnrollmentCard;
