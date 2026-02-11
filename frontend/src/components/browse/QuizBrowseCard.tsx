"use client";

import { useMemo } from "react";

import {
    getExploreActions,
    QuizCard,
    QuizCardSkeleton,
    type QuizCardData,
} from "@/components/quiz/QuizCard";

import type { PublicQuizSummaryDTO } from "@/lib/quiz/types";

interface QuizBrowseCardProps {
    quiz: PublicQuizSummaryDTO;
}

/**
 * Converts PublicQuizSummaryDTO to QuizCardData format
 */
function toQuizCardData(quiz: PublicQuizSummaryDTO): QuizCardData {
    return {
        id: quiz.id.toString(),
        shareableId: quiz.shareableId,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questionCount,
        timeLimit: quiz.timeLimit ?? undefined,
        categoryName: quiz.categoryName,
        // Use creatorDisplayName from backend, fallback to deprecated creatorName for backward compat
        creatorName: quiz.creatorDisplayName ?? quiz.creatorName,
        tags: quiz.tags,
    };
}

export function QuizBrowseCard({ quiz }: QuizBrowseCardProps) {
    const quizCardData = useMemo(() => toQuizCardData(quiz), [quiz]);
    const actions = useMemo(() => getExploreActions(quiz.shareableId), [quiz.shareableId]);

    return (
        <QuizCard
            quiz={quizCardData}
            variant="explore"
            size="default"
            showTags
            actions={actions}
        />
    );
}

export function QuizBrowseCardSkeleton() {
    return <QuizCardSkeleton variant="explore" size="default" />;
}
