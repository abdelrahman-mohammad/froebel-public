"use client";

import { Suspense, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { FileText, GraduationCap, Search, X } from "lucide-react";

import { ContentTypeChip, QuizBrowseCard, QuizBrowseCardSkeleton } from "@/components/browse";
import { CourseCard, CourseCardSkeleton } from "@/components/course";
import { CategoryFilter, SortDropdown, TagFilter } from "@/components/explore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useCategories } from "@/hooks/useCategories";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useExploreFilters } from "@/hooks/useExploreFilters";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { usePublicQuizzes } from "@/hooks/usePublicQuizzes";
import { useTags } from "@/hooks/useTags";

import type { Difficulty, PublicCourseSummaryDTO } from "@/lib/course/types";
import type { PublicQuizSummaryDTO } from "@/lib/quiz/types";

type ContentItem =
    | { type: "quiz"; data: PublicQuizSummaryDTO }
    | { type: "course"; data: PublicCourseSummaryDTO };

function ExploreContent() {
    const router = useRouter();

    // URL state management
    const { filters, updateFilters, clearFilters, hasActiveFilters } = useExploreFilters();

    // Local search input state for controlled input
    const [searchInput, setSearchInput] = useState(filters.search);

    // Categories and tags for filters
    const { flatCategories, getCategoryById, isLoading: isCategoriesLoading } = useCategories();
    const { tags, getTagBySlug, isLoading: isTagsLoading } = useTags();

    // Determine what to show based on content type
    const showQuizzes = filters.contentType === "all" || filters.contentType === "quiz";
    const showCourses = filters.contentType === "all" || filters.contentType === "course";

    // Quiz state with filters
    const {
        quizzes,
        isLoading: isLoadingQuizzes,
        error: quizzesError,
        pagination: quizzesPagination,
        setSearch: setQuizSearch,
        setCategoryId: setQuizCategoryId,
        setTags: setQuizTags,
        setSortBy: setQuizSortBy,
        setPage: setQuizPage,
    } = usePublicQuizzes({
        pageSize: 12,
        initialFilters: {
            search: filters.search,
            categoryId: filters.categoryId || undefined,
            tags: filters.tags,
            sortBy: filters.sortBy,
        },
    });

    // Course state with filters
    const {
        courses,
        isLoading: isLoadingCourses,
        error: coursesError,
        pagination: coursesPagination,
        setSearch: setCourseSearch,
        setCategoryId: setCourseCategoryId,
        setTags: setCourseTags,
        setSortBy: setCourseSortBy,
        setDifficulty,
        setPage: setCoursePage,
    } = usePublicCourses({
        pageSize: 12,
        initialFilters: {
            search: filters.search,
            categoryId: filters.categoryId || undefined,
            difficulty: filters.difficulty || undefined,
            tags: filters.tags,
            sortBy: filters.sortBy,
        },
    });

    // Enrollments to check if already enrolled
    const { enrollments, enroll } = useEnrollments();

    // Sync filter updates to both hooks
    const handleSearchChange = (search: string) => {
        updateFilters({ search });
        setQuizSearch(search);
        setCourseSearch(search);
    };

    const handleCategoryChange = (categoryId: string | null) => {
        updateFilters({ categoryId });
        setQuizCategoryId(categoryId);
        setCourseCategoryId(categoryId);
    };

    const handleTagsChange = (tagSlugs: string[]) => {
        updateFilters({ tags: tagSlugs });
        setQuizTags(tagSlugs);
        setCourseTags(tagSlugs);
    };

    const handleSortChange = (sortBy: "newest" | "popular" | "updated") => {
        updateFilters({ sortBy });
        setQuizSortBy(sortBy);
        setCourseSortBy(sortBy);
    };

    const handleDifficultyChange = (difficulty: Difficulty | null) => {
        updateFilters({ difficulty });
        setDifficulty(difficulty);
    };

    const handleContentTypeChange = (type: "all" | "quiz" | "course") => {
        updateFilters({ contentType: type });
    };

    const handleClearFilters = () => {
        clearFilters();
        setSearchInput("");
        setQuizSearch("");
        setCourseSearch("");
        setQuizCategoryId(null);
        setCourseCategoryId(null);
        setQuizTags([]);
        setCourseTags([]);
        setQuizSortBy("newest");
        setCourseSortBy("newest");
        setDifficulty(null);
    };

    const handleEnroll = async (courseId: string) => {
        try {
            await enroll(courseId);
            router.push(`/course/${courseId}`);
        } catch (error) {
            console.error("Failed to enroll:", error);
        }
    };

    const isEnrolled = (courseId: string) => {
        return enrollments.some((e) => e.courseId === courseId);
    };

    // Remove a specific tag
    const handleRemoveTag = (tagSlug: string) => {
        const newTags = filters.tags.filter((t) => t !== tagSlug);
        handleTagsChange(newTags);
    };

    // Interleave quizzes and courses
    const mixedItems = useMemo((): ContentItem[] => {
        const result: ContentItem[] = [];
        const quizList = showQuizzes ? quizzes : [];
        const courseList = showCourses ? courses : [];
        const maxLen = Math.max(quizList.length, courseList.length);

        for (let i = 0; i < maxLen; i++) {
            if (quizList[i]) {
                result.push({ type: "quiz", data: quizList[i] });
            }
            if (courseList[i]) {
                result.push({ type: "course", data: courseList[i] });
            }
        }
        return result;
    }, [quizzes, courses, showQuizzes, showCourses]);

    const isLoading = (showQuizzes && isLoadingQuizzes) || (showCourses && isLoadingCourses);
    const hasError = quizzesError || coursesError;
    const isEmpty = mixedItems.length === 0 && !isLoading;

    // Handle pagination - load more from both sources
    const handleLoadMore = () => {
        if (showQuizzes && quizzesPagination.page < quizzesPagination.totalPages - 1) {
            setQuizPage(quizzesPagination.page + 1);
        }
        if (showCourses && coursesPagination.page < coursesPagination.totalPages - 1) {
            setCoursePage(coursesPagination.page + 1);
        }
    };

    const hasMoreContent =
        (showQuizzes && quizzesPagination.page < quizzesPagination.totalPages - 1) ||
        (showCourses && coursesPagination.page < coursesPagination.totalPages - 1);

    // Calculate total results
    const totalResults =
        (showQuizzes ? quizzesPagination.totalItems : 0) +
        (showCourses ? coursesPagination.totalItems : 0);

    // Get selected category name for display
    const selectedCategory = filters.categoryId ? getCategoryById(filters.categoryId) : null;

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header with inline search */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="shrink-0">
                    <h1 className="text-3xl font-bold mb-1">Explore</h1>
                    <p className="text-muted-foreground">
                        {filters.search
                            ? `${totalResults} results for "${filters.search}"`
                            : "Discover quizzes and courses created by the community"}
                    </p>
                </div>

                {/* Search Bar - inline with header */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSearchChange(searchInput);
                    }}
                    className="flex gap-2 w-full sm:w-auto sm:min-w-[320px] sm:max-w-md"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            name="search"
                            placeholder="Search quizzes and courses..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {searchInput.trim() && <Button type="submit">Search</Button>}
                </form>
            </div>

            {/* Filter Bar - full width */}
            <div className="mb-6">
                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Content Type Chips */}
                    <ContentTypeChip
                        icon={<FileText className="h-4 w-4" />}
                        label="Quizzes"
                        count={quizzesPagination.totalItems}
                        active={showQuizzes}
                        onToggle={() =>
                            handleContentTypeChange(
                                filters.contentType === "quiz"
                                    ? "all"
                                    : filters.contentType === "all"
                                      ? "course"
                                      : "all"
                            )
                        }
                    />
                    <ContentTypeChip
                        icon={<GraduationCap className="h-4 w-4" />}
                        label="Courses"
                        count={coursesPagination.totalItems}
                        active={showCourses}
                        onToggle={() =>
                            handleContentTypeChange(
                                filters.contentType === "course"
                                    ? "all"
                                    : filters.contentType === "all"
                                      ? "quiz"
                                      : "all"
                            )
                        }
                    />

                    <div className="h-6 w-px bg-border" />

                    {/* Category Filter */}
                    <CategoryFilter
                        categories={flatCategories}
                        selectedCategoryId={filters.categoryId}
                        onSelect={handleCategoryChange}
                        isLoading={isCategoriesLoading}
                    />

                    {/* Tag Filter */}
                    <TagFilter
                        tags={tags}
                        selectedTags={filters.tags}
                        onChange={handleTagsChange}
                        isLoading={isTagsLoading}
                    />

                    {/* Difficulty Filter - only show when courses are visible */}
                    {showCourses && (
                        <Select
                            value={filters.difficulty || "all"}
                            onValueChange={(value) =>
                                handleDifficultyChange(value === "all" ? null : (value as Difficulty))
                            }
                        >
                            <SelectTrigger size="sm" className="w-fit min-w-[120px]">
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="BEGINNER">Beginner</SelectItem>
                                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                <SelectItem value="ADVANCED">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

                    <div className="h-6 w-px bg-border" />

                    {/* Sort Dropdown */}
                    <SortDropdown value={filters.sortBy} onChange={handleSortChange} />
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="text-sm text-muted-foreground">Active filters:</span>

                    {filters.search && (
                        <Badge variant="secondary" className="gap-1">
                            Search: {filters.search}
                            <button
                                onClick={() => {
                                    setSearchInput("");
                                    handleSearchChange("");
                                }}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}

                    {selectedCategory && (
                        <Badge variant="secondary" className="gap-1">
                            Category: {selectedCategory.name}
                            <button
                                onClick={() => handleCategoryChange(null)}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}

                    {filters.tags.map((tagSlug) => {
                        const tag = getTagBySlug(tagSlug);
                        return (
                            <Badge
                                key={tagSlug}
                                variant="secondary"
                                className="gap-1"
                                style={
                                    tag?.color
                                        ? { backgroundColor: `${tag.color}20`, borderColor: tag.color }
                                        : undefined
                                }
                            >
                                {tag?.name || tagSlug}
                                <button
                                    onClick={() => handleRemoveTag(tagSlug)}
                                    className="ml-1 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        );
                    })}

                    {filters.difficulty && (
                        <Badge variant="secondary" className="gap-1">
                            Difficulty: {filters.difficulty.toLowerCase()}
                            <button
                                onClick={() => handleDifficultyChange(null)}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}

                    {filters.sortBy !== "newest" && (
                        <Badge variant="secondary" className="gap-1">
                            Sort: {filters.sortBy === "popular" ? "Most Popular" : "Recently Updated"}
                            <button
                                onClick={() => handleSortChange("newest")}
                                className="ml-1 hover:text-destructive"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Clear all
                    </Button>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="rounded-lg bg-destructive/10 text-destructive p-4 mb-8">
                    <p>{quizzesError || coursesError}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) =>
                        i % 2 === 0 ? (
                            <QuizBrowseCardSkeleton key={i} />
                        ) : (
                            <CourseCardSkeleton key={i} />
                        )
                    )}
                </div>
            )}

            {/* Empty State */}
            {isEmpty && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No results found</h2>
                    <p className="text-muted-foreground max-w-md mb-4">
                        {hasActiveFilters
                            ? "No content matches your filters. Try different search terms or filters."
                            : "There is no public content available yet."}
                    </p>
                    {hasActiveFilters && (
                        <Button variant="outline" onClick={handleClearFilters}>
                            Clear all filters
                        </Button>
                    )}
                </div>
            )}

            {/* Mixed Content Grid */}
            {!isLoading && mixedItems.length > 0 && (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {mixedItems.map((item) =>
                            item.type === "quiz" ? (
                                <QuizBrowseCard key={`quiz-${item.data.id}`} quiz={item.data} />
                            ) : (
                                <CourseCard
                                    key={`course-${item.data.id}`}
                                    course={item.data}
                                    variant="public"
                                    onEnroll={handleEnroll}
                                    isEnrolled={isEnrolled(item.data.id)}
                                    showTypeBadge
                                />
                            )
                        )}
                    </div>

                    {/* Load More Pagination */}
                    {hasMoreContent && (
                        <div className="flex justify-center mt-8">
                            <Button variant="outline" onClick={handleLoadMore}>
                                Load More
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ExploreSkeleton() {
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header with inline search skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                    <Skeleton className="h-9 w-32 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-10 w-full sm:w-80" />
            </div>
            {/* Filters skeleton */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-px w-6 self-center" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-px w-6 self-center" />
                <Skeleton className="h-8 w-28" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) =>
                    i % 2 === 0 ? (
                        <QuizBrowseCardSkeleton key={i} />
                    ) : (
                        <CourseCardSkeleton key={i} />
                    )
                )}
            </div>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<ExploreSkeleton />}>
            <ExploreContent />
        </Suspense>
    );
}
