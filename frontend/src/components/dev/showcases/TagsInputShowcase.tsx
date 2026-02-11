"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { TagsInput } from "@/components/ui/tags-input";

import { ShowcaseItem } from "../ShowcaseItem";

export function TagsInputShowcase() {
    const [tags1, setTags1] = useState<string[]>(["react", "typescript"]);
    const [tags2, setTags2] = useState<string[]>([]);
    const [tags3, setTags3] = useState<string[]>(["one", "two", "three", "four", "five"]);
    const [tags4, setTags4] = useState<string[]>(["programming", "web development", "javascript"]);

    return (
        <ShowcaseItem title="Tags Input" description="Input for adding and managing tags">
            <div className="space-y-6">
                {/* Basic */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
                    <div className="max-w-md">
                        <TagsInput tags={tags1} onChange={setTags1} placeholder="Add a tag..." />
                    </div>
                </div>

                {/* Empty State */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Empty State</h4>
                    <div className="max-w-md">
                        <TagsInput
                            tags={tags2}
                            onChange={setTags2}
                            placeholder="Type and press Enter to add tags..."
                        />
                    </div>
                </div>

                {/* With Max Tags */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Max 5 Tags</h4>
                    <div className="max-w-md">
                        <TagsInput
                            tags={tags3}
                            onChange={setTags3}
                            maxTags={5}
                            placeholder="Add tag..."
                        />
                    </div>
                </div>

                {/* Custom Max Length */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Custom Tag Length (10 chars)
                    </h4>
                    <div className="max-w-md">
                        <TagsInput
                            tags={tags4}
                            onChange={setTags4}
                            maxTagLength={10}
                            placeholder="Add short tags..."
                        />
                    </div>
                </div>

                {/* With Label */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Label</h4>
                    <div className="max-w-md space-y-2">
                        <Label>Quiz Topics</Label>
                        <TagsInput
                            tags={["math", "science", "history"]}
                            onChange={() => {}}
                            placeholder="Add topics..."
                        />
                    </div>
                </div>

                {/* Disabled */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Disabled</h4>
                    <div className="max-w-md">
                        <TagsInput tags={["locked", "readonly"]} onChange={() => {}} disabled />
                    </div>
                </div>

                {/* Practical Examples */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Practical Examples
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <div className="space-y-2">
                            <Label>Skills</Label>
                            <TagsInput
                                tags={["javascript", "python"]}
                                onChange={() => {}}
                                maxTags={8}
                                placeholder="Add skill..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <TagsInput
                                tags={["education", "technology"]}
                                onChange={() => {}}
                                maxTags={5}
                                placeholder="Add category..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}
