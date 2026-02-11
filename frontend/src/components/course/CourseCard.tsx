"use client";

import Image from "next/image";
import Link from "next/link";

import {
    BookOpen,
    Clock,
    Eye,
    EyeOff,
    FileText,
    GraduationCap,
    MoreVertical,
    Pencil,
    Trash2,
    User,
    Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { CourseSummaryDTO, PublicCourseSummaryDTO } from "@/lib/course/types";

import { DifficultyBadge } from "./DifficultyBadge";

// Props for owner's course card (with edit/delete actions)
interface CourseCardOwnerProps {
    course: CourseSummaryDTO;
    variant: "owner";
    onEdit?: (courseId: string) => void;
    onDelete?: (courseId: string) => void;
    onTogglePublish?: (courseId: string, published: boolean) => void;
}

// Props for public course card (with enroll action)
interface CourseCardPublicProps {
    course: PublicCourseSummaryDTO;
    variant: "public";
    onEnroll?: (courseId: string) => void;
    isEnrolled?: boolean;
    showTypeBadge?: boolean;
}

type CourseCardProps = CourseCardOwnerProps | CourseCardPublicProps;

export function CourseCard(props: CourseCardProps) {
    const { course, variant } = props;

    // Common course properties
    const id = course.id;
    const title = course.title;
    const description = course.description;
    const imageUrl = course.imageUrl;
    const difficulty = course.difficulty;
    const materialCount = course.materialCount;
    const quizCount = course.quizCount;
    const enrollmentCount = course.enrollmentCount;

    // Variant-specific properties
    const isOwner = variant === "owner";
    const published = isOwner ? (course as CourseSummaryDTO).published : true;
    const estimatedHours = !isOwner ? (course as PublicCourseSummaryDTO).estimatedHours : undefined;
    const creatorName = !isOwner ? (course as PublicCourseSummaryDTO).creatorName : undefined;
    const tags = !isOwner ? (course as PublicCourseSummaryDTO).tags : undefined;
    const showTypeBadge = !isOwner ? (props as CourseCardPublicProps).showTypeBadge : false;

    return (
        <Card className="group h-full flex flex-col overflow-hidden relative transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            {/* Type Badge */}
            {showTypeBadge && (
                <Badge variant="success" className="absolute top-3 right-3 text-xs gap-1 z-10 bg-emerald-600/90">
                    <GraduationCap className="h-3 w-3" />
                    Course
                </Badge>
            )}

            {/* Course Image */}
            {imageUrl && (
                <div className="relative w-full h-32 bg-muted">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {isOwner && !published && (
                        <Badge
                            variant="secondary"
                            className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
                        >
                            Draft
                        </Badge>
                    )}
                </div>
            )}

            <CardHeader className={imageUrl ? "pt-3" : undefined}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="line-clamp-2 mt-1">
                                {description}
                            </CardDescription>
                        )}
                    </div>
                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm" className="flex-shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Course actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => props.onEdit?.(id)}>
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => props.onTogglePublish?.(id, !published)}
                                >
                                    {published ? (
                                        <>
                                            <EyeOff className="h-4 w-4" />
                                            Unpublish
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="h-4 w-4" />
                                            Publish
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => props.onDelete?.(id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                    {/* Difficulty */}
                    <DifficultyBadge difficulty={difficulty} />

                    {/* Stats */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            <span>{materialCount} materials</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            <span>{quizCount} quizzes</span>
                        </div>
                        {enrollmentCount > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span>{enrollmentCount} enrolled</span>
                            </div>
                        )}
                    </div>

                    {/* Estimated hours (public only) */}
                    {estimatedHours && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span>{estimatedHours}h estimated</span>
                        </div>
                    )}

                    {/* Creator (public only) */}
                    {creatorName && (
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>{creatorName}</span>
                        </div>
                    )}
                </div>

                {/* Tags (public only) */}
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                        {tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs font-normal hover:bg-secondary/80 transition-colors"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {tags.length > 3 && (
                            <Badge
                                variant="outline"
                                className="text-xs font-normal text-muted-foreground"
                            >
                                +{tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-4">
                {isOwner ? (
                    <Button asChild variant="outline" className="w-full group-hover:border-primary/50 transition-colors">
                        <Link href={`/course/${id}/edit`}>Manage Course</Link>
                    </Button>
                ) : (
                    <Button
                        className="w-full group-hover:bg-primary/90 transition-colors"
                        onClick={() => (props as CourseCardPublicProps).onEnroll?.(id)}
                        disabled={(props as CourseCardPublicProps).isEnrolled}
                    >
                        {(props as CourseCardPublicProps).isEnrolled ? "Enrolled" : "Enroll Now"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

export default CourseCard;
