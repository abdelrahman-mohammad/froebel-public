/**
 * Search API Types
 * TypeScript definitions for the Search API
 */

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface SearchQuizItem {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    creatorName?: string;
    questionCount: number;
    timerMinutes?: number;
    tags?: string[];
}

export interface SearchCourseItem {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    creatorName?: string;
    difficulty?: Difficulty;
    lessonCount: number;
    tags?: string[];
}

export interface SearchResultDTO {
    quizzes: SearchQuizItem[];
    courses: SearchCourseItem[];
    totalQuizzes: number;
    totalCourses: number;
}

export interface PageableInfo {
    pageNumber: number;
    pageSize: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: PageableInfo;
    totalElements: number;
    totalPages: number;
}

export interface SearchApiErrorResponse {
    error: string;
    message: string;
    details?: Record<string, string>;
}
