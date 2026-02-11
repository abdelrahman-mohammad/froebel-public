"use client";

import { useCallback, useState } from "react";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { SerializedEditorState } from "lexical";
import { ParagraphNode, TextNode } from "lexical";

import { ContentEditable } from "@/components/editor/editor-ui/content-editable";
import { MathNode } from "@/components/editor/nodes/math-node";
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin";
import { CodeHighlightPlugin } from "@/components/editor/plugins/code-highlight-plugin";
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin";
import { FloatingTextFormatToolbarPlugin } from "@/components/editor/plugins/floating-text-format-plugin";
import { LinkPlugin } from "@/components/editor/plugins/link-plugin";
import { MathPlugin } from "@/components/editor/plugins/math-plugin";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { TooltipProvider } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

import { RichTextContent, isSerializedEditorState, stringToEditorState } from "@/types/rich-text";

// Minimal nodes for inline editing
const inlineNodes = [
    ParagraphNode,
    TextNode,
    CodeNode,
    CodeHighlightNode,
    LinkNode,
    AutoLinkNode,
    MathNode,
];

interface InlineRichTextEditorProps {
    value: RichTextContent | undefined;
    onChange: (value: SerializedEditorState) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Minimal inline rich text editor for answer choices.
 * Supports: bold, italic, underline, strikethrough, code, math, links
 * NO block elements, NO toolbar - uses floating format only.
 */
export function InlineRichTextEditor({
    value,
    onChange,
    placeholder = "Enter text...",
    className,
}: InlineRichTextEditorProps) {
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState(false);

    const onRef = useCallback((elem: HTMLDivElement | null) => {
        if (elem !== null) {
            setFloatingAnchorElem(elem);
        }
    }, []);

    // Convert string to editor state if needed
    const editorState: SerializedEditorState | undefined = isSerializedEditorState(value)
        ? value
        : typeof value === "string" && value
          ? stringToEditorState(value)
          : undefined;

    const editorConfig: InitialConfigType = {
        namespace: "InlineEditor",
        theme: editorTheme,
        nodes: inlineNodes,
        onError: (error: Error) => {
            console.error(error);
        },
        ...(editorState ? { editorState: JSON.stringify(editorState) } : {}),
    };

    return (
        <div
            className={cn(
                "relative rounded-md border bg-background shadow-sm transition-colors focus-within:border-primary focus-within:outline focus-within:outline-2 focus-within:outline-primary/20 focus-within:outline-offset-0",
                // Override paragraph styles for inline context
                "[&_p]:my-0 [&_p]:leading-normal",
                className
            )}
        >
            <LexicalComposer initialConfig={editorConfig}>
                <TooltipProvider>
                    <div ref={onRef} className="relative">
                        <RichTextPlugin
                            contentEditable={
                                <ContentEditable
                                    placeholder={placeholder}
                                    className="min-h-9 px-3 py-2 text-sm outline-none"
                                    placeholderClassName="px-3 py-2 text-sm"
                                />
                            }
                            placeholder={null}
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                    </div>

                    <HistoryPlugin />
                    <MathPlugin />
                    <CodeHighlightPlugin />
                    <AutoLinkPlugin />
                    <LinkPlugin />

                    <FloatingTextFormatToolbarPlugin
                        anchorElem={floatingAnchorElem}
                        setIsLinkEditMode={setIsLinkEditMode}
                    />
                    <FloatingLinkEditorPlugin
                        anchorElem={floatingAnchorElem}
                        isLinkEditMode={isLinkEditMode}
                        setIsLinkEditMode={setIsLinkEditMode}
                    />

                    <OnChangePlugin
                        ignoreSelectionChange={true}
                        onChange={(editorState) => {
                            onChange(editorState.toJSON());
                        }}
                    />
                </TooltipProvider>
            </LexicalComposer>
        </div>
    );
}
