"use client";

import { Suspense, useCallback, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
    AlertCircle,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit,
    FileText,
    Globe,
    GraduationCap,
    HelpCircle,
    Loader2,
    Lock,
    MoreVertical,
    Play,
    Plus,
    Search,
    Trash2,
    Upload,
} from "lucide-react";

import { CourseCard, CourseCardSkeleton, EnrollmentCard } from "@/components/course";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCourses } from "@/hooks/useCourses";
import { useCreateQuiz } from "@/hooks/useCreateQuiz";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useQuizzes } from "@/hooks/useQuizzes";

import type { QuizSummaryDTO } from "@/lib/quiz/types";

type LibraryTab = "quizzes" | "courses" | "enrolled";

function QuizCardSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-1" />
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-20" />
            </CardFooter>
        </Card>
    );
}

function LibraryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get initial tab from URL params
    const initialTab = (searchParams.get("type") as LibraryTab) || "quizzes";
    const [activeTab, setActiveTab] = useState<LibraryTab>(initialTab);

    // Quiz state
    const {
        quizzes,
        isLoading: isLoadingQuizzes,
        error: quizzesError,
        pagination: quizzesPagination,
        deleteQuiz,
        exportQuiz,
        importQuizFromFile,
        setPage: setQuizPage,
        clearError: clearQuizzesError,
    } = useQuizzes();

    // Course state
    const {
        courses,
        isLoading: isLoadingCourses,
        error: coursesError,
        pagination: coursesPagination,
        deleteCourse,
        setCoursePublished,
        setPage: setCoursesPage,
    } = useCourses();

    // Enrollment state
    const {
        enrollments,
        isLoading: isLoadingEnrollments,
        error: enrollmentsError,
        pagination: enrollmentsPagination,
        unenroll,
        setPage: setEnrollmentsPage,
    } = useEnrollments();

    // Local state
    const [searchInput, setSearchInput] = useState("");
    const [deleteQuizDialogOpen, setDeleteQuizDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<QuizSummaryDTO | null>(null);
    const [deleteCourseDialogOpen, setDeleteCourseDialogOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
    const [unenrollDialogOpen, setUnenrollDialogOpen] = useState(false);
    const [courseToUnenroll, setCourseToUnenroll] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    // Update URL when tab changes
    const handleTabChange = (tab: string) => {
        const newTab = tab as LibraryTab;
        setActiveTab(newTab);
        const params = new URLSearchParams();
        if (newTab !== "quizzes") params.set("type", newTab);
        const newURL = params.toString() ? `/library?${params.toString()}` : "/library";
        router.replace(newURL, { scroll: false });
    };

    // Filter quizzes locally based on search input
    const displayedQuizzes = searchInput
        ? quizzes.filter(
              (quiz) =>
                  quiz.title.toLowerCase().includes(searchInput.toLowerCase()) ||
                  quiz.description?.toLowerCase().includes(searchInput.toLowerCase())
          )
        : quizzes;

    // Quiz handlers
    const handlePlayQuiz = useCallback(
        (quizId: string) => {
            router.push(`/quiz/${quizId}`);
        },
        [router]
    );

    const handleEditQuiz = useCallback(
        (quizId: string) => {
            router.push(`/quiz/${quizId}/edit`);
        },
        [router]
    );

    const handleExportQuiz = useCallback(
        async (quizId: string) => {
            try {
                await exportQuiz(quizId);
            } catch (err) {
                console.error("Failed to export quiz:", err);
            }
        },
        [exportQuiz]
    );

    const handleDeleteQuizClick = useCallback((quiz: QuizSummaryDTO) => {
        setQuizToDelete(quiz);
        setDeleteQuizDialogOpen(true);
    }, []);

    const handleDeleteQuizConfirm = useCallback(async () => {
        if (!quizToDelete) return;
        setIsDeleting(true);
        try {
            await deleteQuiz(quizToDelete.shareableId);
            setDeleteQuizDialogOpen(false);
            setQuizToDelete(null);
        } catch (err) {
            console.error("Failed to delete quiz:", err);
        } finally {
            setIsDeleting(false);
        }
    }, [quizToDelete, deleteQuiz]);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setIsImporting(true);
            try {
                await importQuizFromFile(file);
            } catch (err) {
                console.error("Failed to import quiz:", err);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        },
        [importQuizFromFile]
    );

    // Quiz creation hook
    const { createAndRedirect: createQuiz, isCreating: isCreatingQuiz } = useCreateQuiz();

    // Course handlers
    const handleCreateCourse = useCallback(() => {
        router.push("/course/new");
    }, [router]);

    const handleEditCourse = useCallback(
        (courseId: string) => {
            router.push(`/course/${courseId}/edit`);
        },
        [router]
    );

    const handleDeleteCourseClick = useCallback((courseId: string) => {
        setCourseToDelete(courseId);
        setDeleteCourseDialogOpen(true);
    }, []);

    const handleDeleteCourseConfirm = useCallback(async () => {
        if (!courseToDelete) return;
        try {
            await deleteCourse(courseToDelete);
        } catch (error) {
            console.error("Failed to delete course:", error);
        }
        setDeleteCourseDialogOpen(false);
        setCourseToDelete(null);
    }, [courseToDelete, deleteCourse]);

    const handleTogglePublish = useCallback(
        async (courseId: string, published: boolean) => {
            try {
                await setCoursePublished(courseId, published);
            } catch (error) {
                console.error("Failed to toggle publish:", error);
            }
        },
        [setCoursePublished]
    );

    // Enrollment handlers
    const handleContinueCourse = useCallback(
        (courseId: string) => {
            router.push(`/course/${courseId}`);
        },
        [router]
    );

    const handleUnenrollClick = useCallback((courseId: string) => {
        setCourseToUnenroll(courseId);
        setUnenrollDialogOpen(true);
    }, []);

    const handleUnenrollConfirm = useCallback(async () => {
        if (!courseToUnenroll) return;
        try {
            await unenroll(courseToUnenroll);
        } catch (error) {
            console.error("Failed to unenroll:", error);
        }
        setUnenrollDialogOpen(false);
        setCourseToUnenroll(null);
    }, [courseToUnenroll, unenroll]);

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Library</h1>
                    <p className="text-muted-foreground">
                        Manage your quizzes, courses, and enrollments
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="quizzes">
                        <FileText className="h-4 w-4" />
                        Quizzes ({quizzesPagination.totalItems})
                    </TabsTrigger>
                    <TabsTrigger value="courses">
                        <GraduationCap className="h-4 w-4" />
                        Courses ({coursesPagination.totalItems})
                    </TabsTrigger>
                    <TabsTrigger value="enrolled">
                        <BookOpen className="h-4 w-4" />
                        Enrolled ({enrollmentsPagination.totalItems})
                    </TabsTrigger>
                </TabsList>

                {/* Quizzes Tab */}
                <TabsContent value="quizzes">
                    {/* Actions Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search your quizzes..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={createQuiz} disabled={isCreatingQuiz}>
                                {isCreatingQuiz ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                                {isCreatingQuiz ? "Creating..." : "Create"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleImportClick}
                                disabled={isImporting}
                            >
                                {isImporting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                Import
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Error state */}
                    {quizzesError && (
                        <div className="rounded-lg bg-destructive/10 text-destructive p-4 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                <p>{quizzesError}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearQuizzesError}>
                                Dismiss
                            </Button>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoadingQuizzes && (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <QuizCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoadingQuizzes && displayedQuizzes.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <FileText className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">
                                {searchInput ? "No quizzes found" : "No quizzes yet"}
                            </h2>
                            <p className="text-muted-foreground max-w-md mb-6">
                                {searchInput
                                    ? `No quizzes match "${searchInput}". Try a different search term.`
                                    : "Create your first quiz to get started, or import an existing one."}
                            </p>
                            {!searchInput && (
                                <div className="flex gap-2">
                                    <Button onClick={createQuiz} disabled={isCreatingQuiz}>
                                        {isCreatingQuiz ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                        {isCreatingQuiz ? "Creating..." : "Create Quiz"}
                                    </Button>
                                    <Button variant="outline" onClick={handleImportClick}>
                                        <Upload className="h-4 w-4" />
                                        Import Quiz
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quiz grid */}
                    {!isLoadingQuizzes && displayedQuizzes.length > 0 && (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {displayedQuizzes.map((quiz) => (
                                    <Card key={quiz.id} className="h-full flex flex-col">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="line-clamp-2 flex-1">
                                                    {quiz.title}
                                                </CardTitle>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handlePlayQuiz(quiz.shareableId)}
                                                        >
                                                            <Play className="h-4 w-4" />
                                                            Play
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleEditQuiz(quiz.shareableId)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleExportQuiz(quiz.shareableId)
                                                            }
                                                        >
                                                            <Download className="h-4 w-4" />
                                                            Export
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDeleteQuizClick(quiz)
                                                            }
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            {quiz.description && (
                                                <CardDescription className="line-clamp-2">
                                                    {quiz.description}
                                                </CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <HelpCircle className="h-4 w-4" />
                                                    <span>{quiz.questionCount} questions</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>{quiz.totalPoints} points</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <Badge
                                                    variant={
                                                        quiz.isPublic ? "default" : "secondary"
                                                    }
                                                >
                                                    {quiz.isPublic ? (
                                                        <>
                                                            <Globe className="h-3 w-3 mr-1" />
                                                            Public
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Lock className="h-3 w-3 mr-1" />
                                                            Private
                                                        </>
                                                    )}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        quiz.status === "PUBLISHED"
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                >
                                                    {quiz.status === "DRAFT"
                                                        ? "Draft"
                                                        : quiz.status === "PUBLISHED"
                                                          ? "Published"
                                                          : "Archived"}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => handleEditQuiz(quiz.shareableId)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit
                                            </Button>
                                            <Button
                                                className="flex-1"
                                                onClick={() => handlePlayQuiz(quiz.shareableId)}
                                            >
                                                <Play className="h-4 w-4" />
                                                Play
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {quizzesPagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuizPage(quizzesPagination.page - 1)}
                                        disabled={quizzesPagination.page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {quizzesPagination.page + 1} of{" "}
                                        {quizzesPagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuizPage(quizzesPagination.page + 1)}
                                        disabled={
                                            quizzesPagination.page >=
                                            quizzesPagination.totalPages - 1
                                        }
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses">
                    {/* Actions Bar */}
                    <div className="flex justify-end mb-6">
                        <Button onClick={handleCreateCourse}>
                            <Plus className="h-4 w-4" />
                            Create Course
                        </Button>
                    </div>

                    {/* Error state */}
                    {coursesError && (
                        <div className="rounded-lg bg-destructive/10 text-destructive p-4 mb-6">
                            <p>{coursesError}</p>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoadingCourses && (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <CourseCardSkeleton key={i} />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoadingCourses && courses.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <GraduationCap className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Create your first course to start sharing knowledge with others.
                            </p>
                            <Button onClick={handleCreateCourse}>
                                <Plus className="h-4 w-4" />
                                Create Your First Course
                            </Button>
                        </div>
                    )}

                    {/* Course grid */}
                    {!isLoadingCourses && courses.length > 0 && (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {courses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        course={course}
                                        variant="owner"
                                        onEdit={handleEditCourse}
                                        onDelete={handleDeleteCourseClick}
                                        onTogglePublish={handleTogglePublish}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {coursesPagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCoursesPage(coursesPagination.page - 1)}
                                        disabled={coursesPagination.page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {coursesPagination.page + 1} of{" "}
                                        {coursesPagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCoursesPage(coursesPagination.page + 1)}
                                        disabled={
                                            coursesPagination.page >=
                                            coursesPagination.totalPages - 1
                                        }
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>

                {/* Enrolled Tab */}
                <TabsContent value="enrolled">
                    {/* Error state */}
                    {enrollmentsError && (
                        <div className="rounded-lg bg-destructive/10 text-destructive p-4 mb-6">
                            <p>{enrollmentsError}</p>
                        </div>
                    )}

                    {/* Loading state */}
                    {isLoadingEnrollments && (
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoadingEnrollments && enrollments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <BookOpen className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">No enrollments yet</h2>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Browse public courses and enroll to start learning.
                            </p>
                            <Button variant="outline" onClick={() => router.push("/explore")}>
                                <Search className="h-4 w-4" />
                                Browse Courses
                            </Button>
                        </div>
                    )}

                    {/* Enrollments list */}
                    {!isLoadingEnrollments && enrollments.length > 0 && (
                        <>
                            <div className="space-y-4">
                                {enrollments.map((enrollment) => (
                                    <EnrollmentCard
                                        key={enrollment.id}
                                        enrollment={enrollment}
                                        onContinue={handleContinueCourse}
                                        onUnenroll={handleUnenrollClick}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {enrollmentsPagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setEnrollmentsPage(enrollmentsPagination.page - 1)
                                        }
                                        disabled={enrollmentsPagination.page === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Previous
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Page {enrollmentsPagination.page + 1} of{" "}
                                        {enrollmentsPagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setEnrollmentsPage(enrollmentsPagination.page + 1)
                                        }
                                        disabled={
                                            enrollmentsPagination.page >=
                                            enrollmentsPagination.totalPages - 1
                                        }
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>

            {/* Delete Quiz Confirmation Dialog */}
            <AlertDialog open={deleteQuizDialogOpen} onOpenChange={setDeleteQuizDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &ldquo;
                            {quizToDelete?.title}
                            &rdquo;? This action cannot be undone. All questions and attempt data
                            will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setDeleteQuizDialogOpen(false);
                                setQuizToDelete(null);
                            }}
                            disabled={isDeleting}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteQuizConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Course Confirmation Modal */}
            <AlertDialog open={deleteCourseDialogOpen} onOpenChange={setDeleteCourseDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this course? This action cannot be
                            undone. All materials, enrollments, and progress data will be
                            permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCourseConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Unenroll Confirmation Modal */}
            <AlertDialog open={unenrollDialogOpen} onOpenChange={setUnenrollDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unenroll from Course</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unenroll from this course? Your progress will
                            be saved and you can re-enroll at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnenrollConfirm}>
                            Unenroll
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function LibrarySkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <Skeleton className="h-9 w-32 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-10 w-80 mb-6" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <QuizCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export default function LibraryPage() {
    return (
        <Suspense fallback={<LibrarySkeleton />}>
            <LibraryContent />
        </Suspense>
    );
}
