"use client";

import { useState } from "react";

import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { Difficulty } from "@/lib/course/types";

interface CourseMetaFormProps {
    title: string;
    description: string;
    imageUrl?: string;
    difficulty: Difficulty;
    estimatedHours?: number;
    tags: string[];
    onTitleChange: (title: string) => void;
    onDescriptionChange: (description: string) => void;
    onImageUrlChange: (url: string | undefined) => void;
    onDifficultyChange: (difficulty: Difficulty) => void;
    onEstimatedHoursChange: (hours: number | undefined) => void;
    onTagsChange: (tags: string[]) => void;
    errors?: Record<string, string>;
}

export function CourseMetaForm({
    title,
    description,
    imageUrl,
    difficulty,
    estimatedHours,
    tags,
    onTitleChange,
    onDescriptionChange,
    onImageUrlChange,
    onDifficultyChange,
    onEstimatedHoursChange,
    onTagsChange,
    errors = {},
}: CourseMetaFormProps) {
    const [newTag, setNewTag] = useState("");

    const handleAddTag = () => {
        const tag = newTag.trim().toLowerCase();
        if (tag && !tags.includes(tag) && tags.length < 10) {
            onTagsChange([...tags, tag]);
            setNewTag("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onTagsChange(tags.filter((t) => t !== tagToRemove));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter course title"
                    className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Describe what students will learn in this course"
                    rows={4}
                    className={errors.description ? "border-destructive" : ""}
                />
                <p className="text-sm text-muted-foreground">
                    {description.length}/2000 characters
                </p>
                {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                )}
            </div>

            {/* Image URL */}
            <div className="space-y-2">
                <Label htmlFor="imageUrl">Cover Image URL</Label>
                <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl || ""}
                    onChange={(e) => onImageUrlChange(e.target.value || undefined)}
                    placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-muted-foreground">
                    Optional. Provide a URL to a cover image for your course.
                </p>
                {imageUrl && (
                    <div className="mt-2">
                        <img
                            src={imageUrl}
                            alt="Course cover preview"
                            className="max-w-xs rounded-lg border"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Difficulty and Estimated Hours */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select
                        value={difficulty}
                        onValueChange={(v) => onDifficultyChange(v as Difficulty)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                        id="estimatedHours"
                        type="number"
                        min={0}
                        max={1000}
                        step={0.5}
                        value={estimatedHours || ""}
                        onChange={(e) =>
                            onEstimatedHoursChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                            )
                        }
                        placeholder="e.g., 10"
                    />
                </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add a tag"
                        className="flex-1"
                        maxLength={50}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={!newTag.trim() || tags.length >= 10}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Press Enter or click + to add. Maximum 10 tags.
                </p>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-1 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CourseMetaForm;
