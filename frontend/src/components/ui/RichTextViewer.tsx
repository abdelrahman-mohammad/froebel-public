"use client";

import { Component, ReactNode, useMemo } from "react";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { OverflowNode } from "@lexical/overflow";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ParagraphNode, TextNode } from "lexical";

import { TweetNode } from "@/components/editor/nodes/embeds/tweet-node";
import { YouTubeNode } from "@/components/editor/nodes/embeds/youtube-node";
import { EmojiNode } from "@/components/editor/nodes/emoji-node";
import { ImageNode } from "@/components/editor/nodes/image-node";
import { KeywordNode } from "@/components/editor/nodes/keyword-node";
import { LayoutContainerNode } from "@/components/editor/nodes/layout-container-node";
import { LayoutItemNode } from "@/components/editor/nodes/layout-item-node";
import { MathNode } from "@/components/editor/nodes/math-node";
import { MentionNode } from "@/components/editor/nodes/mention-node";
import { editorTheme } from "@/components/editor/themes/editor-theme";

import { cn } from "@/lib/utils";

import {
    RichTextContent,
    getPlainText,
    isSerializedEditorState,
} from "@/types/rich-text";
import { SerializedEditorState, SerializedLexicalNode } from "lexical";

// All nodes for full content rendering - must match editor nodes for compatibility
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
];

interface RichTextViewerProps {
    content: RichTextContent | undefined | null;
    className?: string;
    inline?: boolean;
}

/**
 * Read-only rich text viewer component.
 * Renders both plain strings and SerializedEditorState content.
 */
export function RichTextViewer({ content, className, inline = false }: RichTextViewerProps) {
    // Handle empty content
    if (!content) return null;

    // For plain strings, render as simple text
    if (typeof content === "string") {
        if (!content.trim()) return null;

        return (
            <div className={cn("rich-text-viewer", className)}>
                {inline ? (
                    <span>{content}</span>
                ) : (
                    content.split("\n").map((line, i) => <p key={i}>{line || <br />}</p>)
                )}
            </div>
        );
    }

    // For SerializedEditorState, render with Lexical (with error recovery)
    if (!isSerializedEditorState(content)) {
        return null;
    }

    return (
        <RichTextErrorBoundary fallbackContent={getPlainText(content)} className={className}>
            <LexicalReadOnly content={content} className={className} inline={inline} />
        </RichTextErrorBoundary>
    );
}

/**
 * Lexical-based read-only renderer
 */
function LexicalReadOnly({
    content,
    className,
    inline,
}: {
    content: RichTextContent;
    className?: string;
    inline?: boolean;
}) {
    const editorConfig: InitialConfigType = useMemo(
        () => ({
            namespace: "RichTextViewer",
            theme: editorTheme,
            nodes: viewerNodes,
            editable: false,
            onError: (error: Error) => {
                console.error("RichTextViewer error:", error);
            },
            editorState: isSerializedEditorState(content) ? JSON.stringify(content) : undefined,
        }),
        [content]
    );

    return (
        <div
            className={cn("rich-text-viewer", inline && "inline", className)}
            role="document"
            aria-label="Rich text content"
        >
            <LexicalComposer initialConfig={editorConfig}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className={cn("outline-none", inline && "[&>p]:inline [&>p]:m-0")}
                            aria-readonly={true}
                        />
                    }
                    placeholder={null}
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </LexicalComposer>
        </div>
    );
}

/**
 * Simple inline text viewer for choice text in quiz taking.
 * Falls back to plain text extraction for performance.
 */
export function InlineTextViewer({
    content,
    className,
}: {
    content: RichTextContent | undefined | null;
    className?: string;
}) {
    if (!content) return null;

    // For simple content, just show plain text
    const text = getPlainText(content);
    if (!text.trim()) return null;

    // Check if content has any actual formatting using AST traversal
    const hasFormatting =
        isSerializedEditorState(content) && hasActualFormatting(content);

    // If no formatting, show plain text for performance
    if (!hasFormatting) {
        return <span className={className}>{text}</span>;
    }

    // Otherwise render with Lexical
    return <RichTextViewer content={content} className={className} inline />;
}

// ============================================================================
// Error Boundary for Graceful Degradation
// ============================================================================

interface RichTextErrorBoundaryProps {
    children: ReactNode;
    fallbackContent: string;
    className?: string;
}

interface RichTextErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

/**
 * Error boundary that gracefully degrades to plain text if Lexical rendering fails.
 * This prevents broken quiz content from crashing the entire page.
 */
class RichTextErrorBoundary extends Component<
    RichTextErrorBoundaryProps,
    RichTextErrorBoundaryState
> {
    constructor(props: RichTextErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): RichTextErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("RichTextViewer render error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const { fallbackContent, className } = this.props;

            // Render plain text fallback
            return (
                <div className={cn("rich-text-viewer rich-text-fallback", className)}>
                    {fallbackContent.split("\n").map((line, i) => (
                        <p key={i}>{line || <br />}</p>
                    ))}
                </div>
            );
        }

        return this.props.children;
    }
}

// ============================================================================
// Formatting Detection Utilities
// ============================================================================

/**
 * Node types that indicate structural formatting beyond plain paragraphs
 */
const FORMATTED_NODE_TYPES = new Set([
    "heading",
    "quote",
    "list",
    "listitem",
    "table",
    "tablerow",
    "tablecell",
    "code",
    "link",
    "autolink",
    "image",
    "horizontalrule",
    "math",
    "tweet",
    "youtube",
    "mention",
    "hashtag",
    "emoji",
    "keyword",
    "layout-container",
    "layout-item",
]);

/**
 * Check if a SerializedEditorState contains actual formatting.
 * Uses proper AST traversal instead of naive string matching.
 *
 * Detects:
 * - Text nodes with format flags (bold, italic, underline, etc.)
 * - Text nodes with styles (color, font, etc.)
 * - Non-paragraph block types (headings, lists, tables, etc.)
 * - Links, images, and other inline elements
 */
function hasActualFormatting(content: SerializedEditorState): boolean {
    return checkNodeForFormatting(content.root);
}

/**
 * Recursively check a node and its children for formatting
 */
function checkNodeForFormatting(node: SerializedLexicalNode): boolean {
    // Check if this node type indicates formatting
    if (FORMATTED_NODE_TYPES.has(node.type)) {
        return true;
    }

    // Check text nodes for format flags or styles
    if (node.type === "text") {
        const textNode = node as SerializedLexicalNode & {
            format?: number;
            style?: string;
        };

        // format !== 0 means some formatting is applied (bold, italic, etc.)
        if (textNode.format && textNode.format !== 0) {
            return true;
        }

        // Non-empty style means inline styles are applied
        if (textNode.style && textNode.style.trim() !== "") {
            return true;
        }
    }

    // Check code-highlight nodes (syntax highlighting)
    if (node.type === "code-highlight") {
        return true;
    }

    // Recursively check children
    if ("children" in node && Array.isArray(node.children)) {
        for (const child of node.children as SerializedLexicalNode[]) {
            if (checkNodeForFormatting(child)) {
                return true;
            }
        }
    }

    return false;
}
