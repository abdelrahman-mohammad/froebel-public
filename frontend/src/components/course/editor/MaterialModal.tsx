"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// This file uses a valid pattern of syncing form state when modal opens
import { useEffect, useState } from "react";

import { File, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { type CourseValidationError, validateMaterial } from "@/contexts/CourseEditorContext";

import type {
    CreateMaterialRequest,
    MaterialContentType,
    MaterialDTO,
    UpdateMaterialRequest,
} from "@/lib/course/types";

import { MarkdownEditor } from "./MarkdownEditor";

interface MaterialModalProps {
    open: boolean;
    onClose: () => void;
    material: MaterialDTO | null; // null for new material
    onSave: (data: CreateMaterialRequest | UpdateMaterialRequest) => Promise<void>;
    isSaving?: boolean;
}

export function MaterialModal({
    open,
    onClose,
    material,
    onSave,
    isSaving = false,
}: MaterialModalProps) {
    const isEditing = !!material;

    // Form state
    const [title, setTitle] = useState("");
    const [contentType, setContentType] = useState<MaterialContentType>("TEXT");
    const [content, setContent] = useState("");
    const [fileId, setFileId] = useState<string | undefined>();
    const [durationMinutes, setDurationMinutes] = useState<number | undefined>();
    const [errors, setErrors] = useState<CourseValidationError[]>([]);

    // Reset form when material changes or modal opens/closes
    useEffect(() => {
        if (open) {
            if (material) {
                setTitle(material.title);
                setContentType(material.contentType);
                setContent(material.content || "");
                setFileId(material.fileId);
                setDurationMinutes(material.durationMinutes);
            } else {
                setTitle("");
                setContentType("TEXT");
                setContent("");
                setFileId(undefined);
                setDurationMinutes(undefined);
            }
            setErrors([]);
        }
    }, [open, material]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data: CreateMaterialRequest | UpdateMaterialRequest = {
            title: title.trim(),
            contentType,
            content: contentType === "TEXT" ? content : undefined,
            fileId: contentType === "FILE" ? fileId : undefined,
            durationMinutes,
        };

        const validationErrors = validateMaterial(data);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        await onSave(data);
    };

    const getFieldError = (field: string) => {
        return errors.find((e) => e.field === field)?.message;
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Material" : "Add New Material"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter material title"
                            className={getFieldError("title") ? "border-destructive" : ""}
                        />
                        {getFieldError("title") && (
                            <p className="text-sm text-destructive">{getFieldError("title")}</p>
                        )}
                    </div>

                    {/* Content Type Tabs */}
                    <div className="space-y-2">
                        <Label>Content Type</Label>
                        <Tabs
                            value={contentType}
                            onValueChange={(v) => setContentType(v as MaterialContentType)}
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="TEXT" className="gap-2">
                                    <FileText className="h-4 w-4" />
                                    Text (Markdown)
                                </TabsTrigger>
                                <TabsTrigger value="FILE" className="gap-2">
                                    <File className="h-4 w-4" />
                                    File
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="TEXT" className="mt-4 space-y-2">
                                <Label>Content *</Label>
                                <MarkdownEditor
                                    value={content}
                                    onChange={setContent}
                                    height={350}
                                    placeholder="Write your material content using Markdown..."
                                />
                                {getFieldError("content") && (
                                    <p className="text-sm text-destructive">
                                        {getFieldError("content")}
                                    </p>
                                )}
                            </TabsContent>

                            <TabsContent value="FILE" className="mt-4 space-y-2">
                                <Label>File Upload</Label>
                                <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8">
                                    <div className="text-center">
                                        <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-sm text-muted-foreground mb-2">
                                            File upload will be implemented with media service
                                        </p>
                                        <Input
                                            type="text"
                                            placeholder="Enter file ID (temporary)"
                                            value={fileId || ""}
                                            onChange={(e) => setFileId(e.target.value || undefined)}
                                            className="max-w-xs mx-auto"
                                        />
                                    </div>
                                </div>
                                {getFieldError("fileId") && (
                                    <p className="text-sm text-destructive">
                                        {getFieldError("fileId")}
                                    </p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                        <Input
                            id="duration"
                            type="number"
                            min={0}
                            max={600}
                            value={durationMinutes || ""}
                            onChange={(e) =>
                                setDurationMinutes(
                                    e.target.value ? parseInt(e.target.value, 10) : undefined
                                )
                            }
                            placeholder="e.g., 15"
                            className="max-w-[200px]"
                        />
                        <p className="text-sm text-muted-foreground">
                            How long it takes to complete this material
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isEditing ? "Save Changes" : "Add Material"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default MaterialModal;
