"use client";

import React, { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { ArrowLeft, Brain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { countQuestionsByChapter, hasMultipleChapters } from "@/lib/chapter-utils";

import type { BatchSize, MemorizeOptions, ShuffleMode } from "@/types/memorize";
import { defaultMemorizeOptions } from "@/types/memorize";
import type { Quiz } from "@/types/quiz";

export interface MemorizeSettingsProps {
    /** Quiz to memorize */
    quiz: Quiz;
    /** Callback when starting memorization */
    onStart: (options: MemorizeOptions) => void;
}

const batchSizes: { value: BatchSize; label: string }[] = [
    { value: 3, label: "3" },
    { value: 5, label: "5" },
    { value: 10, label: "10" },
    { value: 15, label: "15" },
    { value: "all", label: "All" },
];

const shuffleModes: {
    value: ShuffleMode;
    label: string;
    description: string;
}[] = [
    { value: "none", label: "None", description: "Keep original order" },
    { value: "full", label: "Full", description: "Completely random order" },
    {
        value: "within-chapters",
        label: "Within Chapters",
        description: "Shuffle questions within each chapter",
    },
    {
        value: "chapters-only",
        label: "Chapters Only",
        description: "Shuffle chapter order, keep question order",
    },
    {
        value: "both",
        label: "Both",
        description: "Shuffle chapters and questions within",
    },
];

/**
 * Settings screen for memorize mode
 * Configure batch size and shuffle options before starting
 */
export function MemorizeSettings({ quiz, onStart }: MemorizeSettingsProps) {
    const router = useRouter();
    const [options, setOptions] = useState<MemorizeOptions>(defaultMemorizeOptions);
    const [selectedChapters, setSelectedChapters] = useState<Set<string>>(
        new Set(quiz.chapters?.map((c) => c.id) || [])
    );

    const showChapters = hasMultipleChapters(quiz);
    const questionCounts = useMemo(() => countQuestionsByChapter(quiz), [quiz]);

    // Calculate effective question count (after chapter filter)
    const questionCount = useMemo(() => {
        if (!showChapters || options.batchSize !== "chapters") {
            if (selectedChapters.size > 0 && showChapters) {
                return quiz.questions.filter((q) => q.chapter && selectedChapters.has(q.chapter))
                    .length;
            }
            return quiz.questions.length;
        }
        // For chapter batching, count questions in selected chapters
        let count = 0;
        for (const chapterId of selectedChapters) {
            count += questionCounts.get(chapterId) || 0;
        }
        return count;
    }, [quiz, showChapters, selectedChapters, questionCounts, options.batchSize]);

    const questionText = questionCount === 1 ? "question" : "questions";

    // Calculate number of batches
    const getBatchCount = () => {
        if (options.batchSize === "chapters") {
            return selectedChapters.size;
        }
        if (options.batchSize === "all") return 1;
        return Math.ceil(questionCount / options.batchSize);
    };

    const handleBatchSizeChange = (size: BatchSize | "chapters") => {
        setOptions((prev) => ({ ...prev, batchSize: size }));
    };

    const handleShuffleModeChange = (mode: ShuffleMode) => {
        setOptions((prev) => ({ ...prev, shuffleMode: mode }));
    };

    const handleShuffleChoicesChange = (checked: boolean) => {
        setOptions((prev) => ({ ...prev, shuffleChoices: checked }));
    };

    const handleChapterToggle = (chapterId: string) => {
        setSelectedChapters((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(chapterId)) {
                newSet.delete(chapterId);
            } else {
                newSet.add(chapterId);
            }
            return newSet;
        });
    };

    const handleSelectAllChapters = () => {
        setSelectedChapters(new Set(quiz.chapters?.map((c) => c.id) || []));
    };

    const handleDeselectAllChapters = () => {
        setSelectedChapters(new Set());
    };

    const handleStart = () => {
        const finalOptions: MemorizeOptions = {
            ...options,
            selectedChapters:
                showChapters && selectedChapters.size > 0
                    ? Array.from(selectedChapters)
                    : undefined,
        };
        onStart(finalOptions);
    };

    const handleBack = () => {
        router.push("/");
    };

    // Disable start if no chapters selected (when using chapter batching)
    const canStart = !showChapters || selectedChapters.size > 0;

    // Filter shuffle modes based on whether quiz has chapters
    const availableShuffleModes = showChapters
        ? shuffleModes
        : shuffleModes.filter((m) => m.value === "none" || m.value === "full");

    return (
        <div className="max-w-lg mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center gap-6 text-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full text-primary bg-primary/10">
                    <Brain className="h-12 w-12" />
                </div>

                <h1 className="text-3xl font-bold">Memorize Mode</h1>

                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">{quiz.title}</h2>
                    <p className="text-muted-foreground">
                        {questionCount} {questionText}
                    </p>
                </div>

                {/* Chapter Selection (only shown when quiz has multiple chapters) */}
                {showChapters && (
                    <div className="w-full space-y-3">
                        <Label className="text-sm font-medium">Select Chapters</Label>
                        <div className="flex justify-center gap-2 mb-2">
                            <Button variant="ghost" size="sm" onClick={handleSelectAllChapters}>
                                Select All
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleDeselectAllChapters}>
                                Deselect All
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card max-h-48 overflow-y-auto">
                            {quiz.chapters?.map((chapter) => {
                                const count = questionCounts.get(chapter.id) || 0;
                                return (
                                    <div key={chapter.id} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-muted transition-colors cursor-pointer">
                                        <Checkbox
                                            id={`chapter-${chapter.id}`}
                                            checked={selectedChapters.has(chapter.id)}
                                            onCheckedChange={() => handleChapterToggle(chapter.id)}
                                        />
                                        <label
                                            htmlFor={`chapter-${chapter.id}`}
                                            className="flex items-center gap-2 flex-1 cursor-pointer text-sm"
                                        >
                                            <span className="flex-1 font-medium">{chapter.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {count} {count === 1 ? "question" : "questions"}
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Batch Size Selection */}
                <div className="w-full space-y-3">
                    <Label className="text-sm font-medium">Questions per Batch</Label>
                    <div className="flex flex-wrap justify-center gap-2">
                        {batchSizes.map((size) => (
                            <Button
                                key={size.value}
                                variant={options.batchSize === size.value ? "default" : "secondary"}
                                size="sm"
                                onClick={() => handleBatchSizeChange(size.value)}
                            >
                                {size.label}
                            </Button>
                        ))}
                        {showChapters && (
                            <Button
                                variant={options.batchSize === "chapters" ? "default" : "secondary"}
                                size="sm"
                                onClick={() => handleBatchSizeChange("chapters")}
                            >
                                By Chapter
                            </Button>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {getBatchCount()} {getBatchCount() === 1 ? "batch" : "batches"} will be
                        created
                    </p>
                </div>

                {/* Shuffle Mode Selection */}
                <div className="w-full space-y-3">
                    <Label className="text-sm font-medium">Shuffle Mode</Label>
                    <div className="flex flex-wrap justify-center gap-2">
                        {availableShuffleModes.map((mode) => (
                            <Button
                                key={mode.value}
                                variant={
                                    options.shuffleMode === mode.value ? "default" : "secondary"
                                }
                                size="sm"
                                onClick={() => handleShuffleModeChange(mode.value)}
                                title={mode.description}
                            >
                                {mode.label}
                            </Button>
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {shuffleModes.find((m) => m.value === options.shuffleMode)?.description}
                    </p>
                </div>

                {/* Shuffle Choices Option */}
                <div className="w-full space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                        <div>
                            <Label htmlFor="shuffle-choices">Shuffle Answer Choices</Label>
                            <p className="text-sm text-muted-foreground">
                                Randomize the order of answer options
                            </p>
                        </div>
                        <Switch
                            id="shuffle-choices"
                            checked={options.shuffleChoices}
                            onCheckedChange={handleShuffleChoicesChange}
                        />
                    </div>
                </div>

                {/* Start Button */}
                <Button
                    onClick={handleStart}
                    size="lg"
                    className="w-full mt-4 gap-2"
                    disabled={!canStart}
                >
                    <Brain className="h-5 w-5" />
                    Start Memorizing
                </Button>
            </div>
        </div>
    );
}

export default MemorizeSettings;
