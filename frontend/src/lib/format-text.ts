/**
 * Text formatting utilities for Markdown and LaTeX rendering
 * Migrated from quiz-player.js: formatQuestionText, formatAnswerText, renderLatex
 */
import DOMPurify from "dompurify";
import { marked } from "marked";

import type { RichTextContent } from "@/types/rich-text";
import { getPlainText } from "@/types/rich-text";

// Configure marked options
marked.setOptions({
    breaks: true, // Convert \n to <br>
    gfm: true, // GitHub Flavored Markdown
});

/**
 * Format question text with Markdown
 * Used for full question text that may contain block elements
 * Accepts RichTextContent (string or SerializedEditorState)
 */
export function formatQuestionText(text: RichTextContent | string | undefined | null): string {
    if (!text) return "";
    // Extract plain text if it's rich text content
    const plainText = typeof text === "string" ? text : getPlainText(text);
    if (!plainText) return "";
    try {
        const html = marked.parse(plainText) as string;
        // Sanitize HTML to prevent XSS attacks
        return DOMPurify.sanitize(html);
    } catch {
        return DOMPurify.sanitize(plainText);
    }
}

/**
 * Format answer text with inline Markdown only
 * Used for answer choices that should not contain block elements
 * Accepts RichTextContent (string or SerializedEditorState)
 */
export function formatAnswerText(text: RichTextContent | string | undefined | null): string {
    if (!text) return "";
    // Extract plain text if it's rich text content
    const plainText = typeof text === "string" ? text : getPlainText(text);
    if (!plainText) return "";
    try {
        const html = marked.parseInline(plainText) as string;
        // Sanitize HTML to prevent XSS attacks
        return DOMPurify.sanitize(html);
    } catch {
        return DOMPurify.sanitize(plainText);
    }
}

/**
 * Render LaTeX in a container element using KaTeX
 * Call this after the component mounts and when content changes
 *
 * @param container - The DOM element containing text with LaTeX
 */
export function renderLatex(container: HTMLElement | null): void {
    if (!container) return;

    // Dynamic import to avoid SSR issues
    if (typeof window !== "undefined") {
        import("katex/contrib/auto-render").then((module) => {
            const renderMathInElement = module.default;
            if (typeof renderMathInElement === "function") {
                renderMathInElement(container, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true }, // Block equations
                        { left: "$", right: "$", display: false }, // Inline equations
                        { left: "\\[", right: "\\]", display: true },
                        { left: "\\(", right: "\\)", display: false },
                    ],
                    throwOnError: false,
                });
            }
        });
    }
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Count the number of {blank} placeholders in question text
 * Accepts RichTextContent (string or SerializedEditorState)
 */
export function countBlanks(text: RichTextContent | string | undefined | null): number {
    if (!text) return 0;
    const plainText = typeof text === "string" ? text : getPlainText(text);
    const matches = plainText.match(/\{blank\}/gi);
    return matches ? matches.length : 0;
}

/**
 * Count the number of {dropdown} placeholders in question text
 * Accepts RichTextContent (string or SerializedEditorState)
 */
export function countDropdowns(text: RichTextContent | string | undefined | null): number {
    if (!text) return 0;
    const plainText = typeof text === "string" ? text : getPlainText(text);
    const matches = plainText.match(/\{dropdown\}/gi);
    return matches ? matches.length : 0;
}
