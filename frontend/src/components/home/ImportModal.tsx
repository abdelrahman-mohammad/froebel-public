"use client";

import React, { useCallback, useRef, useState } from "react";

import { AlertCircle, FileJson, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

export interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportFile: (file: File) => Promise<void>;
    onImportString: (jsonString: string) => void;
}

export function ImportModal({ isOpen, onClose, onImportFile, onImportString }: ImportModalProps) {
    const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
    const [jsonText, setJsonText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        setJsonText("");
        setError(null);
        setIsImporting(false);
        setDragActive(false);
        setActiveTab("file");
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onClose();
    }, [resetState, onClose]);

    const handleFileSelect = useCallback(
        async (file: File) => {
            if (!file.name.endsWith(".json")) {
                setError("Please select a JSON file");
                return;
            }

            setError(null);
            setIsImporting(true);

            try {
                await onImportFile(file);
                handleClose();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to import quiz");
            } finally {
                setIsImporting(false);
            }
        },
        [onImportFile, handleClose]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);

            const file = e.dataTransfer.files?.[0];
            if (file) {
                handleFileSelect(file);
            }
        },
        [handleFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
    }, []);

    const handlePasteImport = useCallback(() => {
        if (!jsonText.trim()) {
            setError("Please paste some JSON");
            return;
        }

        setError(null);
        setIsImporting(true);

        try {
            onImportString(jsonText);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to import quiz");
            setIsImporting(false);
        }
    }, [jsonText, onImportString, handleClose]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Quiz</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4">
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as "file" | "paste")}
                    >
                        <TabsList className="w-full">
                            <TabsTrigger value="file" className="flex-1">
                                <Upload className="h-4 w-4" />
                                Upload File
                            </TabsTrigger>
                            <TabsTrigger value="paste" className="flex-1">
                                <FileJson className="h-4 w-4" />
                                Paste JSON
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="file">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={cn(
                                    "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg",
                                    "cursor-pointer transition-colors",
                                    dragActive
                                        ? "border-primary bg-primary-light"
                                        : "border-border-light hover:border-primary hover:bg-muted"
                                )}
                            >
                                <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                                <p className="text-sm font-medium mb-1">
                                    Drag and drop a JSON file here
                                </p>
                                <p className="text-xs text-muted-foreground">or click to browse</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="paste">
                            <Textarea
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                placeholder="Paste your quiz JSON here..."
                                className="min-h-[200px] font-mono text-sm"
                            />
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={handleClose} disabled={isImporting}>
                        Cancel
                    </Button>
                    {activeTab === "paste" && (
                        <Button
                            onClick={handlePasteImport}
                            disabled={isImporting || !jsonText.trim()}
                        >
                            {isImporting ? "Importing..." : "Import"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ImportModal;
