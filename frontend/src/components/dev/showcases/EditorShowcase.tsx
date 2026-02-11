"use client";

import { useState } from "react";

import { SerializedEditorState } from "lexical";

import { Editor } from "@/components/blocks/editor-x/editor";
import { EditorSize } from "@/components/editor/context/editor-size-context";

import { ShowcaseItem } from "../ShowcaseItem";

const INITIAL_STATE_WITH_MATH = {
    root: {
        children: [
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "This editor supports ",
                        type: "text",
                        version: 1,
                    },
                    {
                        detail: 0,
                        format: 1,
                        mode: "normal",
                        style: "",
                        text: "rich text formatting",
                        type: "text",
                        version: 1,
                    },
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: ", code blocks, tables, images, embeds, and ",
                        type: "text",
                        version: 1,
                    },
                    {
                        detail: 0,
                        format: 1,
                        mode: "normal",
                        style: "",
                        text: "Math/LaTeX",
                        type: "text",
                        version: 1,
                    },
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: " equations!",
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
                textFormat: 0,
                textStyle: "",
            },
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Try pressing ",
                        type: "text",
                        version: 1,
                    },
                    {
                        detail: 0,
                        format: 16,
                        mode: "normal",
                        style: "",
                        text: "/",
                        type: "text",
                        version: 1,
                    },
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: " to open the command menu and insert math equations, images, tables, and more.",
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
                textFormat: 0,
                textStyle: "",
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
};

const SIMPLE_INITIAL_STATE = {
    root: {
        children: [
            {
                children: [
                    {
                        detail: 0,
                        format: 0,
                        mode: "normal",
                        style: "",
                        text: "Type here...",
                        type: "text",
                        version: 1,
                    },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
                textFormat: 0,
                textStyle: "",
            },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
    },
};

export function EditorShowcase() {
    const [serializedState, setSerializedState] = useState<SerializedEditorState | undefined>(
        undefined
    );
    const [selectedSize, setSelectedSize] = useState<EditorSize>("default");

    return (
        <ShowcaseItem
            title="Rich Text Editor"
            description="Lexical-based editor with toolbar, markdown, code, tables, images, embeds, and Math/LaTeX support"
        >
            <div className="space-y-6">
                {/* Size Variants */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Size Variants
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                        Different sizes for various use cases: small for compact inputs, default for
                        standard use, large for prominent editing.
                    </p>
                    <div className="space-y-4">
                        {/* Size selector buttons */}
                        <div className="flex gap-2">
                            {(["sm", "default", "lg"] as const).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                        selectedSize === size
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background hover:bg-muted border-border"
                                    }`}
                                >
                                    {size === "sm"
                                        ? "Small"
                                        : size === "default"
                                          ? "Default"
                                          : "Large"}
                                </button>
                            ))}
                        </div>
                        {/* Editor with selected size */}
                        <div className="border rounded-lg overflow-hidden">
                            <Editor
                                key={selectedSize}
                                size={selectedSize}
                                editorSerializedState={
                                    SIMPLE_INITIAL_STATE as unknown as SerializedEditorState
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Full Featured Editor */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Full Featured Editor (Default Size)
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                        Type <code className="bg-muted px-1 rounded">/</code> to open the command
                        menu. Double-click math equations to edit them.
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                        <Editor
                            editorSerializedState={
                                INITIAL_STATE_WITH_MATH as unknown as SerializedEditorState
                            }
                            onSerializedChange={setSerializedState}
                        />
                    </div>
                </div>

                {/* Resizable Editor */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Resizable Editor
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                        Drag the bottom edge to resize the editor height vertically.
                    </p>
                    <div className="border rounded-lg overflow-hidden">
                        <Editor
                            size="sm"
                            resizable
                            editorSerializedState={
                                SIMPLE_INITIAL_STATE as unknown as SerializedEditorState
                            }
                        />
                    </div>
                </div>

                {/* Features List */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Available Features
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Text formatting</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Headings (H1-H3)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Lists & Checklists</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Code blocks</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Tables</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Images</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>YouTube/Twitter embeds</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Emoji picker</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>@Mentions</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Markdown shortcuts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Drag & drop</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span className="font-medium">Math/LaTeX (KaTeX)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Vertical resize</span>
                        </div>
                    </div>
                </div>

                {/* Math Examples */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Math/LaTeX Examples
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                        Use the toolbar Insert → Math or type{" "}
                        <code className="bg-muted px-1 rounded">/math</code> to insert equations.
                    </p>
                    <div className="space-y-2 text-sm font-mono bg-muted/50 p-3 rounded-lg">
                        <div>
                            <span className="text-muted-foreground">Inline:</span>{" "}
                            <code>$x^2 + y^2 = z^2$</code>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Block:</span>{" "}
                            <code>
                                {"$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$"}
                            </code>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Matrix:</span>{" "}
                            <code>{"$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$"}</code>
                        </div>
                    </div>
                </div>

                {/* Serialized Output */}
                {serializedState && (
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                            Serialized State (JSON)
                        </h4>
                        <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-48">
                            {JSON.stringify(serializedState, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </ShowcaseItem>
    );
}
