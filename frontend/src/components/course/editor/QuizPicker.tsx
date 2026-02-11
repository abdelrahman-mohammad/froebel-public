"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// This file uses a valid pattern of resetting selection when dialog opens
import { useEffect, useState } from "react";

import { Check, Loader2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useQuizzes } from "@/hooks/useQuizzes";

interface QuizPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (quizIds: string[]) => void;
    selectedIds?: string[];
    mode?: "single" | "multiple";
    title?: string;
}

export function QuizPicker({
    open,
    onClose,
    onSelect,
    selectedIds = [],
    mode = "single",
    title = "Select Quiz",
}: QuizPickerProps) {
    const { quizzes, isLoading, pagination, setPage } = useQuizzes();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

    // Reset selection when dialog opens
    useEffect(() => {
        if (open) {
            setSelected(new Set(selectedIds));
            setSearch("");
        }
    }, [open, selectedIds]);

    const filteredQuizzes = quizzes.filter(
        (quiz) =>
            quiz.title.toLowerCase().includes(search.toLowerCase()) ||
            quiz.description?.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggle = (quizId: string) => {
        if (mode === "single") {
            setSelected(new Set([quizId]));
        } else {
            const newSelected = new Set(selected);
            if (newSelected.has(quizId)) {
                newSelected.delete(quizId);
            } else {
                newSelected.add(quizId);
            }
            setSelected(newSelected);
        }
    };

    const handleConfirm = () => {
        onSelect(Array.from(selected));
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search quizzes..."
                        className="pl-10"
                    />
                </div>

                {/* Quiz list */}
                <ScrollArea className="h-[400px] border rounded-lg">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredQuizzes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <p className="text-muted-foreground">
                                {search
                                    ? "No quizzes match your search"
                                    : "No quizzes available. Create some quizzes first."}
                            </p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredQuizzes.map((quiz) => {
                                const isSelected = selected.has(quiz.id);
                                return (
                                    <button
                                        key={quiz.id}
                                        onClick={() => handleToggle(quiz.id)}
                                        className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                                            isSelected
                                                ? "bg-primary/10 border-primary"
                                                : "hover:bg-muted"
                                        }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">
                                            {mode === "multiple" ? (
                                                <Checkbox checked={isSelected} />
                                            ) : (
                                                <div
                                                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                        isSelected
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-muted-foreground"
                                                    }`}
                                                >
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{quiz.title}</div>
                                            {quiz.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {quiz.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {quiz.questionCount} questions
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {quiz.totalPoints} pts
                                                </Badge>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(pagination.page - 1)}
                            disabled={pagination.page === 0}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {pagination.page + 1} of {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages - 1}
                        >
                            Next
                        </Button>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={selected.size === 0}>
                        {mode === "single"
                            ? "Select"
                            : `Select ${selected.size} Quiz${selected.size !== 1 ? "zes" : ""}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default QuizPicker;
