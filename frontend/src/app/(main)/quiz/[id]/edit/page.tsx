"use client";

import React, { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { QuizEditor } from "@/components/editor/QuizEditor";
import { Button } from "@/components/ui/button";

import { EditorProvider } from "@/contexts/EditorContext";

import { useQuizEditor } from "@/hooks/useQuizEditor";

export default function EditQuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;
    const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

    const { quiz, quizMeta, isLoading, error, loadQuiz } = useQuizEditor();

    useEffect(() => {
        let cancelled = false;

        if (quizId && !hasAttemptedLoad) {
            loadQuiz(quizId)
                .catch(() => {
                    // Error is handled by the hook
                })
                .finally(() => {
                    if (!cancelled) {
                        setHasAttemptedLoad(true);
                    }
                });
        }

        return () => {
            cancelled = true;
        };
    }, [quizId, loadQuiz, hasAttemptedLoad]);

    // Show loading state while loading OR before first load attempt completes
    if (isLoading || !hasAttemptedLoad) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                    <h2 className="text-xl font-semibold">Error Loading Quiz</h2>
                    <p className="text-muted-foreground max-w-md">
                        {error ||
                            "The quiz could not be found or you don't have permission to edit it."}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => router.push("/")}
                            variant="outline"
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                        <Button onClick={() => router.push("/library")} variant="outline">
                            My Library
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <EditorProvider initialQuiz={quiz}>
            <QuizEditor quizId={quizId} quizMeta={quizMeta} />
        </EditorProvider>
    );
}
