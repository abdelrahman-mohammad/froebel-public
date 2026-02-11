"use client";

import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { OverflowNode } from "@lexical/overflow";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ParagraphNode, SerializedEditorState, SerializedLexicalNode, TextNode } from "lexical";
import { createPortal } from "react-dom";

import { TweetNode } from "@/components/editor/nodes/embeds/tweet-node";
import { YouTubeNode } from "@/components/editor/nodes/embeds/youtube-node";
import { EmojiNode } from "@/components/editor/nodes/emoji-node";
import { ImageNode } from "@/components/editor/nodes/image-node";
import { KeywordNode } from "@/components/editor/nodes/keyword-node";
import { LayoutContainerNode } from "@/components/editor/nodes/layout-container-node";
import { LayoutItemNode } from "@/components/editor/nodes/layout-item-node";
import { MathNode } from "@/components/editor/nodes/math-node";
import { MentionNode } from "@/components/editor/nodes/mention-node";
import {
    PlaceholderNode,
    SerializedPlaceholderNode,
} from "@/components/editor/nodes/placeholder-node";
import { editorTheme } from "@/components/editor/themes/editor-theme";

import { cn } from "@/lib/utils";

import { RichTextContent, isSerializedEditorState } from "@/types/rich-text";

// All nodes for full content rendering, including PlaceholderNode
const viewerNodes = [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    OverflowNode,
    HashtagNode,
    CodeNode,
    CodeHighlightNode,
    HorizontalRuleNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    MentionNode,
    ImageNode,
    EmojiNode,
    KeywordNode,
    LayoutContainerNode,
    LayoutItemNode,
    MathNode,
    TweetNode,
    YouTubeNode,
    PlaceholderNode,
];

// CSS class used by PlaceholderNode for DOM identification
const PLACEHOLDER_MARKER_CLASS = "lexical-placeholder-marker";

interface RichTextWithPlaceholdersProps {
    /** Rich text content containing placeholders */
    content: RichTextContent | undefined | null;
    /** The placeholder pattern to find (e.g., "{blank}" or "{dropdown}") */
    placeholderPattern: string;
    /** Callback to render each placeholder */
    renderPlaceholder: (index: number) => ReactNode;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Rich text viewer that replaces placeholder text with custom React components.
 * Preserves all Lexical formatting while allowing interactive elements.
 */
export function RichTextWithPlaceholders({
    content,
    placeholderPattern,
    renderPlaceholder,
    className,
}: RichTextWithPlaceholdersProps) {
    // Handle empty content
    if (!content) return null;

    // For plain strings, use simple replacement
    if (typeof content === "string") {
        return (
            <PlainTextWithPlaceholders
                text={content}
                placeholderPattern={placeholderPattern}
                renderPlaceholder={renderPlaceholder}
                className={className}
            />
        );
    }

    // For SerializedEditorState, use Lexical with placeholder markers
    if (!isSerializedEditorState(content)) {
        return null;
    }

    return (
        <LexicalWithPlaceholders
            content={content}
            placeholderPattern={placeholderPattern}
            renderPlaceholder={renderPlaceholder}
            className={className}
        />
    );
}

/**
 * Plain text renderer with placeholder replacement
 */
function PlainTextWithPlaceholders({
    text,
    placeholderPattern,
    renderPlaceholder,
    className,
}: {
    text: string;
    placeholderPattern: string;
    renderPlaceholder: (index: number) => ReactNode;
    className?: string;
}) {
    const parts = useMemo(() => {
        const result: ReactNode[] = [];
        const segments = splitByPattern(text, placeholderPattern);
        let placeholderIndex = 0;

        segments.forEach((segment, i) => {
            if (segment.isPlaceholder) {
                result.push(
                    <span key={`placeholder-${placeholderIndex}`} className="inline">
                        {renderPlaceholder(placeholderIndex)}
                    </span>
                );
                placeholderIndex++;
            } else if (segment.text) {
                result.push(<span key={`text-${i}`}>{segment.text}</span>);
            }
        });

        return result;
    }, [text, placeholderPattern, renderPlaceholder]);

    return <div className={cn("rich-text-with-placeholders", className)}>{parts}</div>;
}

/**
 * Lexical-based renderer with placeholder replacement via DOM portals
 */
function LexicalWithPlaceholders({
    content,
    placeholderPattern,
    renderPlaceholder,
    className,
}: {
    content: SerializedEditorState;
    placeholderPattern: string;
    renderPlaceholder: (index: number) => ReactNode;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Pre-process the content to replace placeholder text with PlaceholderNodes
    const processedContent = useMemo(() => {
        return transformPlaceholders(content, placeholderPattern);
    }, [content, placeholderPattern]);

    const editorConfig: InitialConfigType = useMemo(
        () => ({
            namespace: "RichTextWithPlaceholders",
            theme: editorTheme,
            nodes: viewerNodes,
            editable: false,
            onError: (error: Error) => {
                console.error("RichTextWithPlaceholders error:", error);
            },
            editorState: JSON.stringify(processedContent),
        }),
        [processedContent]
    );

    return (
        <div
            ref={containerRef}
            className={cn("rich-text-with-placeholders", className)}
        >
            <LexicalComposer initialConfig={editorConfig}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable className="outline-none" aria-readonly={true} />
                    }
                    placeholder={null}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <PlaceholderPortalPlugin
                    containerRef={containerRef}
                    renderPlaceholder={renderPlaceholder}
                />
            </LexicalComposer>
        </div>
    );
}

/**
 * Plugin that creates React portals for placeholder elements
 */
function PlaceholderPortalPlugin({
    containerRef,
    renderPlaceholder,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    renderPlaceholder: (index: number) => ReactNode;
}) {
    const [editor] = useLexicalComposerContext();
    const [portalContainers, setPortalContainers] = useState<Map<number, HTMLElement>>(
        new Map()
    );

    useEffect(() => {
        // Wait for DOM to be ready after Lexical renders
        const timeoutId = setTimeout(() => {
            if (!containerRef.current) return;

            // Find all placeholder markers in the DOM (created by PlaceholderNode)
            const markers = containerRef.current.querySelectorAll(
                `.${PLACEHOLDER_MARKER_CLASS}`
            );

            const newContainers = new Map<number, HTMLElement>();
            markers.forEach((marker) => {
                const indexStr = marker.getAttribute("data-placeholder-index");
                if (indexStr !== null) {
                    const index = parseInt(indexStr, 10);
                    newContainers.set(index, marker as HTMLElement);
                }
            });

            setPortalContainers(newContainers);
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [containerRef, editor]);

    // Render portals for each placeholder
    const portals: ReactNode[] = [];
    portalContainers.forEach((container, index) => {
        portals.push(
            createPortal(
                <span className="inline">{renderPlaceholder(index)}</span>,
                container,
                `placeholder-portal-${index}`
            )
        );
    });

    return <>{portals}</>;
}

/**
 * Split text by a pattern, returning segments with metadata
 */
function splitByPattern(
    text: string,
    pattern: string
): Array<{ text: string; isPlaceholder: boolean }> {
    const escapedPattern = escapeRegex(pattern);
    const regex = new RegExp(`(${escapedPattern})`, "gi");
    const parts = text.split(regex);

    return parts
        .filter((part) => part !== "")
        .map((part) => ({
            text: part,
            isPlaceholder: part.toLowerCase() === pattern.toLowerCase(),
        }));
}

/**
 * Transform Lexical content to replace placeholder text with PlaceholderNodes.
 * This preserves all formatting while inserting placeholder markers.
 */
function transformPlaceholders(
    content: SerializedEditorState,
    placeholderPattern: string
): SerializedEditorState {
    let placeholderIndex = 0;

    function processNode(node: SerializedLexicalNode): SerializedLexicalNode[] {
        // Handle text nodes - split on placeholder pattern
        if (node.type === "text" && "text" in node) {
            const textNode = node as SerializedLexicalNode & {
                text: string;
                format?: number;
                detail?: number;
                mode?: string;
                style?: string;
            };
            const text = textNode.text;

            const segments = splitByPattern(text, placeholderPattern);

            // If no placeholders, return original
            if (!segments.some((s) => s.isPlaceholder)) {
                return [node];
            }

            const result: SerializedLexicalNode[] = [];

            for (const segment of segments) {
                if (segment.isPlaceholder) {
                    // Create a PlaceholderNode (DecoratorNode)
                    const placeholderNode: SerializedPlaceholderNode = {
                        type: "placeholder",
                        version: 1,
                        placeholderIndex: placeholderIndex,
                    };
                    result.push(placeholderNode as unknown as SerializedLexicalNode);
                    placeholderIndex++;
                } else if (segment.text) {
                    // Preserve original formatting for non-placeholder text
                    result.push({
                        ...textNode,
                        text: segment.text,
                    } as SerializedLexicalNode);
                }
            }

            return result;
        }

        // Handle nodes with children - recursively process
        if ("children" in node && Array.isArray(node.children)) {
            const processedChildren: SerializedLexicalNode[] = [];
            for (const child of node.children as SerializedLexicalNode[]) {
                processedChildren.push(...processNode(child));
            }
            return [
                {
                    ...node,
                    children: processedChildren,
                } as SerializedLexicalNode,
            ];
        }

        // Return other nodes as-is
        return [node];
    }

    // Process root
    const processedRoot = processNode(content.root)[0];

    return {
        ...content,
        root: processedRoot as typeof content.root,
    };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default RichTextWithPlaceholders;
