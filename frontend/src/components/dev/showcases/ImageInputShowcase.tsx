"use client";

import { useState } from "react";

import { ImageInput } from "@/components/ui/image-input";
import { Label } from "@/components/ui/label";

import { ShowcaseItem } from "../ShowcaseItem";

export function ImageInputShowcase() {
    const [image1, setImage1] = useState<string | null>(null);
    const [image2, setImage2] = useState<string | null>(null);
    const [image3, setImage3] = useState<string | null>("https://picsum.photos/400/400");

    return (
        <ShowcaseItem title="Image Input" description="Drag and drop image upload with URL support">
            <div className="space-y-6">
                {/* Square Aspect Ratio */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Square (Icon)
                    </h4>
                    <div className="space-y-2">
                        <Label>Profile Icon</Label>
                        <ImageInput
                            value={image1}
                            onChange={setImage1}
                            aspectRatio="square"
                            placeholder="Drop icon here"
                            helpText="Recommended: 128x128px, max 5MB"
                        />
                    </div>
                </div>

                {/* Banner Aspect Ratio */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Banner</h4>
                    <div className="space-y-2 max-w-md">
                        <Label>Cover Image</Label>
                        <ImageInput
                            value={image2}
                            onChange={setImage2}
                            aspectRatio="banner"
                            placeholder="Drop banner image here"
                            helpText="Recommended: 1200x400px, max 5MB"
                        />
                    </div>
                </div>

                {/* With Pre-filled Image */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Image</h4>
                    <div className="space-y-2">
                        <Label>Quiz Thumbnail</Label>
                        <ImageInput
                            value={image3}
                            onChange={setImage3}
                            aspectRatio="square"
                            helpText="Click the X to remove the image"
                        />
                    </div>
                </div>

                {/* Side by Side */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Side by Side</h4>
                    <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                            <Label>Light Mode Logo</Label>
                            <ImageInput value={null} onChange={() => {}} aspectRatio="square" />
                        </div>
                        <div className="space-y-2">
                            <Label>Dark Mode Logo</Label>
                            <ImageInput value={null} onChange={() => {}} aspectRatio="square" />
                        </div>
                    </div>
                </div>

                {/* Usage Info */}
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-2">Features:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Drag and drop files</li>
                        <li>Click to browse files</li>
                        <li>Paste image URLs</li>
                        <li>Supports JPEG, PNG, WebP, GIF</li>
                        <li>Max file size: 5MB</li>
                    </ul>
                </div>
            </div>
        </ShowcaseItem>
    );
}
