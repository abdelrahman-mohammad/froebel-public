"use client";

import type { ReactNode } from "react";

import {
    DecoratorNode,
    DOMConversionMap,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from "lexical";

export type SerializedPlaceholderNode = Spread<
    {
        placeholderIndex: number;
    },
    SerializedLexicalNode
>;

const PLACEHOLDER_MARKER_CLASS = "lexical-placeholder-marker";

/**
 * A DecoratorNode that serves as a placeholder marker in rich text content.
 * Used by RichTextWithPlaceholders to inject interactive elements.
 */
export class PlaceholderNode extends DecoratorNode<ReactNode> {
    __placeholderIndex: number;

    static getType(): string {
        return "placeholder";
    }

    static clone(node: PlaceholderNode): PlaceholderNode {
        return new PlaceholderNode(node.__placeholderIndex, node.__key);
    }

    constructor(placeholderIndex: number, key?: NodeKey) {
        super(key);
        this.__placeholderIndex = placeholderIndex;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement("span");
        span.className = PLACEHOLDER_MARKER_CLASS;
        span.setAttribute("data-placeholder-index", String(this.__placeholderIndex));
        return span;
    }

    updateDOM(): false {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement("span");
        element.className = PLACEHOLDER_MARKER_CLASS;
        element.setAttribute("data-placeholder-index", String(this.__placeholderIndex));
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return null; // Not importing from DOM
    }

    static importJSON(serializedNode: SerializedPlaceholderNode): PlaceholderNode {
        return new PlaceholderNode(serializedNode.placeholderIndex);
    }

    exportJSON(): SerializedPlaceholderNode {
        return {
            type: "placeholder",
            version: 1,
            placeholderIndex: this.__placeholderIndex,
        };
    }

    getTextContent(): string {
        return ""; // Placeholder has no text content
    }

    isInline(): boolean {
        return true;
    }

    decorate(): ReactNode {
        // Return null - the actual content is injected via portal
        return null;
    }

    getPlaceholderIndex(): number {
        return this.__placeholderIndex;
    }
}

export function $createPlaceholderNode(placeholderIndex: number): PlaceholderNode {
    return new PlaceholderNode(placeholderIndex);
}

export function $isPlaceholderNode(
    node: LexicalNode | null | undefined
): node is PlaceholderNode {
    return node instanceof PlaceholderNode;
}
