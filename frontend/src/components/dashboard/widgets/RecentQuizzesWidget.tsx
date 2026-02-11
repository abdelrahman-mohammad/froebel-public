"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FileText, Pencil, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useCreateQuiz } from "@/hooks/useCreateQuiz";

import type { QuizSummaryDTO } from "@/lib/quiz/types";

import { DashboardSection } from "../DashboardSection";
import { EmptyState } from "../EmptyState";

interface RecentQuizzesWidgetProps {
    quizzes: QuizSummaryDTO[];
    className?: string;
}

interface QuizItemProps {
    quiz: QuizSummaryDTO;
    onEdit: (quizId: string) => void;
    onPlay: (quizId: string) => void;
}

function QuizItem({ quiz, onEdit, onPlay }: QuizItemProps) {
    return (
        <div className="flex items-center gap-4 py-4">
            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <Link
                        href={`/quiz/${quiz.shareableId}/edit`}
                        className="text-sm font-medium hover:underline truncate"
                    >
                        {quiz.title}
                    </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                    {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                </p>
            </div>
            <Badge
                variant={quiz.status === "PUBLISHED" ? "default" : "secondary"}
                className="flex-shrink-0"
            >
                {quiz.status === "DRAFT"
                    ? "Draft"
                    : quiz.status === "PUBLISHED"
                      ? "Published"
                      : "Archived"}
            </Badge>
            <div className="flex items-center gap-1 flex-shrink-0">
                <Button size="icon" variant="ghost" onClick={() => onEdit(quiz.shareableId)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                {quiz.status === "PUBLISHED" && (
                    <Button size="icon" variant="ghost" onClick={() => onPlay(quiz.shareableId)}>
                        <Play className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export function RecentQuizzesWidget({ quizzes, className }: RecentQuizzesWidgetProps) {
    const router = useRouter();
    const { createAndRedirect } = useCreateQuiz();

    const handleEdit = (quizId: string) => {
        router.push(`/quiz/${quizId}/edit`);
    };

    const handlePlay = (quizId: string) => {
        router.push(`/quiz/${quizId}`);
    };

    return (
        <DashboardSection
            title="My Quizzes"
            action={quizzes.length > 0 ? { label: "View all", href: "/library" } : undefined}
            className={className}
        >
            {quizzes.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No quizzes yet"
                    description="Create your first quiz to get started"
                    action={{ label: "Create quiz", onClick: createAndRedirect }}
                    className="py-4"
                />
            ) : (
                <div className="divide-y">
                    {quizzes.map((quiz) => (
                        <QuizItem
                            key={quiz.id}
                            quiz={quiz}
                            onEdit={handleEdit}
                            onPlay={handlePlay}
                        />
                    ))}
                </div>
            )}
        </DashboardSection>
    );
}
