"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { Archive, BookOpen, FileText, Globe, Link2, Loader2, Plus, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useEditor } from "@/contexts/EditorContext";

import type { QuizStatus } from "@/types/quiz";

// Tab components
import { DetailsTab } from "./tabs/DetailsTab";
import { QuestionsTab } from "./tabs/QuestionsTab";
import { SettingsTab } from "./tabs/SettingsTab";

interface EditorWorkspaceProps {
    quizId?: string;
    onSave: () => Promise<void>;
    onPublish?: () => Promise<void>;
    onUpdatePublished?: () => Promise<void>;
    isSaving: boolean;
    status?: QuizStatus;
    hasUnpublishedChanges?: boolean;
    error: string | null;
}

export function EditorWorkspace({
    quizId,
    onSave,
    onPublish,
    onUpdatePublished,
    isSaving,
    status,
    hasUnpublishedChanges,
    error,
}: EditorWorkspaceProps) {
    const { state, startCreateQuestion, addChapter } = useEditor();
    const { quiz, isDirty } = state;
    const lastErrorRef = useRef<{ message: string; timestamp: number } | null>(null);
    const [activeTab, setActiveTab] = useState("details");
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

    const tabs = [
        { name: "Details", value: "details" },
        { name: "Questions", value: "questions" },
        { name: "Settings", value: "settings" },
    ];

    // Calculate underline position based on active tab
    useLayoutEffect(() => {
        const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
        const activeTabElement = tabRefs.current[activeIndex];

        if (activeTabElement) {
            const { offsetLeft, offsetWidth } = activeTabElement;
            setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
        }
    }, [activeTab]);

    // Show error toast when a new error occurs
    // Uses timestamp-based deduplication to allow same message after 1 second
    useEffect(() => {
        if (error) {
            const now = Date.now();
            const lastError = lastErrorRef.current;
            const isDuplicate = lastError &&
                lastError.message === error &&
                now - lastError.timestamp < 1000;

            if (!isDuplicate) {
                toast.error(error);
                lastErrorRef.current = { message: error, timestamp: now };
            }
        } else {
            lastErrorRef.current = null;
        }
    }, [error]);

    // Create chapter handler - switches to questions tab
    const handleCreateChapter = useCallback(() => {
        addChapter("");
        setActiveTab("questions");
    }, [addChapter]);

    // Create question handler - switches to questions tab
    const handleCreateQuestion = useCallback(() => {
        startCreateQuestion();
        setActiveTab("questions");
    }, [startCreateQuestion]);

    return (
        <div className="flex flex-col h-full">
            {/* Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col overflow-hidden gap-0 pt-4"
            >
                <div className="flex items-center justify-between bg-background px-4 border-b border-border">
                    <TabsList className="bg-transparent relative rounded-none p-0 pb-0 gap-0 h-auto border-0 border-b-0">
                        {tabs.map((tab, index) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                ref={(el) => {
                                    tabRefs.current[index] = el;
                                }}
                                className="bg-transparent !border-0 rounded-none px-4 py-2.5 text-sm text-muted-foreground data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent hover:text-foreground hover:bg-muted transition-colors"
                            >
                                {tab.name}
                                {tab.value === "questions" && quiz.questions.length > 0 && (
                                    <span className="text-xs bg-card text-foreground px-1.5 py-0.5 rounded tabular-nums font-bold border border-border-light">
                                        {quiz.questions.length}
                                    </span>
                                )}
                            </TabsTrigger>
                        ))}
                        <motion.div
                            className="bg-primary absolute bottom-0 h-0.5 rounded-full"
                            initial={false}
                            animate={{ left: underlineStyle.left, width: underlineStyle.width }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                        />
                    </TabsList>
                </div>

                <TabsContent value="details" className="flex-1 overflow-auto m-0 p-0">
                    <DetailsTab />
                </TabsContent>

                <TabsContent value="questions" className="flex-1 overflow-auto m-0 p-0">
                    <QuestionsTab quizId={quizId} />
                </TabsContent>

                <TabsContent value="settings" className="flex-1 overflow-auto m-0 p-0">
                    <SettingsTab />
                </TabsContent>
            </Tabs>

            {/* Bottom Action Bar - visible across all tabs */}
            <div className="flex items-center gap-2 p-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Button size="sm" onClick={handleCreateQuestion} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Create Question
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateChapter}
                    className="gap-1.5"
                >
                    <BookOpen className="h-3.5 w-3.5" />
                    Create Chapter
                </Button>

                {/* Status badges - only shown for API quizzes */}
                {quizId && status === "draft" && (
                    <Badge variant="secondary" className="gap-1 ml-2">
                        <FileText className="h-3 w-3" />
                        Draft
                    </Badge>
                )}

                {quizId && status === "published" && (
                    <>
                        <Badge variant="default" className="gap-1 ml-2 bg-green-600 hover:bg-green-600">
                            <Globe className="h-3 w-3" />
                            Published
                        </Badge>
                        {quiz.settings?.isPublic === false && (
                            <Badge variant="outline" className="gap-1">
                                <Link2 className="h-3 w-3" />
                                Unlisted
                            </Badge>
                        )}
                        {hasUnpublishedChanges && (
                            <Badge variant="warning" className="gap-1">
                                Draft changes
                            </Badge>
                        )}
                    </>
                )}

                {quizId && status === "archived" && (
                    <Badge variant="outline" className="gap-1 ml-2 text-muted-foreground">
                        <Archive className="h-3 w-3" />
                        Archived
                    </Badge>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Unsaved changes indicator and save/publish buttons */}
                <div className="flex items-center gap-2">
                    {isDirty && (
                        <span
                            className="inline-block h-2 w-2 rounded-full bg-orange-500"
                            title="Unsaved changes"
                        />
                    )}

                    {/* Save Draft button */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onSave}
                        className="gap-1.5"
                        disabled={isSaving || !isDirty}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-3.5 w-3.5" />
                                {quizId ? "Save Draft" : "Save"}
                            </>
                        )}
                    </Button>

                    {/* Publish button - only for API quizzes that aren't published yet */}
                    {quizId && onPublish && status !== "published" && (
                        <Button
                            size="sm"
                            onClick={onPublish}
                            className="gap-1.5"
                            disabled={isSaving}
                        >
                            <Globe className="h-3.5 w-3.5" />
                            Publish
                        </Button>
                    )}

                    {/* Update Published button - for published quizzes with draft changes */}
                    {quizId && onUpdatePublished && status === "published" && hasUnpublishedChanges && (
                        <Button
                            size="sm"
                            variant="warning"
                            onClick={onUpdatePublished}
                            className="gap-1.5"
                            disabled={isSaving}
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Update Published
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
