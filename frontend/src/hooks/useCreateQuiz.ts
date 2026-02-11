"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createQuiz } from "@/lib/quiz/api";

/**
 * Hook to create a new quiz and redirect to the edit page.
 * Creates the quiz immediately with "Untitled Quiz" as the default title.
 */
export function useCreateQuiz() {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);

    const createAndRedirect = useCallback(async () => {
        if (isCreating) return; // Prevent double-clicks

        setIsCreating(true);
        try {
            const quiz = await createQuiz({ title: "Untitled Quiz" });
            router.push(`/quiz/${quiz.shareableId}/edit`);
        } catch (error) {
            console.error("Failed to create quiz:", error);
            toast.error("Failed to create quiz. Please try again.");
        } finally {
            setIsCreating(false);
        }
    }, [isCreating, router]);

    return { createAndRedirect, isCreating };
}
