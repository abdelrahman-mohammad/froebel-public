"use client";

import Link from "next/link";

import { BookOpen, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { RecommendedQuiz } from "@/hooks/useGamificationMock";

import { cn } from "@/lib/utils";

import { DashboardSection } from "../DashboardSection";

interface RecommendedQuizzesWidgetProps {
    quizzes: RecommendedQuiz[];
    className?: string;
}

interface QuizCardProps {
    quiz: RecommendedQuiz;
}

function getDifficultyVariant(difficulty: string): "default" | "secondary" | "destructive" {
    switch (difficulty) {
        case "easy":
            return "secondary";
        case "hard":
            return "destructive";
        default:
            return "default";
    }
}

function QuizCard({ quiz }: QuizCardProps) {
    return (
        <Card className="hover:border-primary transition-colors">
            <CardContent className="p-4">
                {/* Reason tag */}
                <p className="text-xs text-muted-foreground mb-2">{quiz.reason}</p>

                {/* Title */}
                <h3 className="font-medium mb-2 line-clamp-2">{quiz.title}</h3>

                {/* Meta info */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                        {quiz.category}
                    </Badge>
                    <Badge
                        variant={getDifficultyVariant(quiz.difficulty)}
                        className="text-xs capitalize"
                    >
                        {quiz.difficulty}
                    </Badge>
                </div>

                {/* Footer with XP and question count */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm font-medium text-chart-4">
                        <Zap className="h-4 w-4" />
                        <span>+{quiz.estimatedXP} XP</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {quiz.questionCount} questions
                    </span>
                </div>

                {/* Start button */}
                <Button asChild size="sm" className="w-full mt-3">
                    <Link href={`/quiz/${quiz.shareableId}`}>Start Quiz</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export function RecommendedQuizzesWidget({ quizzes, className }: RecommendedQuizzesWidgetProps) {
    if (quizzes.length === 0) {
        return (
            <DashboardSection title="Recommended For You" className={className}>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                        Take some quizzes to get personalized recommendations!
                    </p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/explore">Browse Quizzes</Link>
                    </Button>
                </div>
            </DashboardSection>
        );
    }

    return (
        <DashboardSection
            title="Recommended For You"
            action={{ label: "Browse all", href: "/explore" }}
            className={className}
        >
            <div
                className={cn(
                    "grid gap-4",
                    "grid-cols-1 sm:grid-cols-2",
                    // Horizontal scroll on mobile
                    "max-sm:flex max-sm:overflow-x-auto max-sm:-mx-4 max-sm:px-4 max-sm:gap-3 max-sm:pb-2"
                )}
            >
                {quizzes.slice(0, 4).map((quiz) => (
                    <div key={quiz.id} className="max-sm:flex-shrink-0 max-sm:w-[280px]">
                        <QuizCard quiz={quiz} />
                    </div>
                ))}
            </div>
        </DashboardSection>
    );
}
