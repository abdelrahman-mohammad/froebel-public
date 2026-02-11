import { SerializedEditorState, SerializedLexicalNode } from "lexical";

/**
 * Rich text content that can be either:
 * - A plain string (legacy/backwards compatible)
 * - A Lexical serialized editor state
 */
export type RichTextContent = string | SerializedEditorState;

/**
 * Type guard to check if content is serialized editor state
 */
export function isSerializedEditorState(
    content: RichTextContent | undefined | null
): content is SerializedEditorState {
    return (
        content !== null &&
        content !== undefined &&
        typeof content === "object" &&
        "root" in content
    );
}

/**
 * Check if rich text content is empty
 */
export function isRichTextEmpty(content: RichTextContent | undefined | null): boolean {
    if (!content) return true;
    const text = getPlainText(content);
    return !text || text.trim() === "";
}

/**
 * Get plain text from RichTextContent for validation/preview
 */
export function getPlainText(content: RichTextContent | undefined | null): string {
    if (!content) return "";
    if (typeof content === "string") return content;

    // Extract text from Lexical state by traversing nodes
    return extractTextFromNode(content.root);
}

/**
 * Recursively extract text from a Lexical node
 */
function extractTextFromNode(node: SerializedLexicalNode): string {
    // Handle text nodes
    if (node.type === "text" && "text" in node) {
        return (node as { text: string }).text;
    }

    // Handle linebreak nodes
    if (node.type === "linebreak") {
        return "\n";
    }

    // Handle nodes with children
    if ("children" in node && Array.isArray(node.children)) {
        const children = node.children as SerializedLexicalNode[];
        const texts = children.map(extractTextFromNode);

        // Add newline after block elements
        const isBlock = ["paragraph", "heading", "quote", "listitem"].includes(node.type);
        return texts.join("") + (isBlock ? "\n" : "");
    }

    return "";
}

/**
 * Create empty editor state for initialization
 */
export function createEmptyEditorState(): SerializedEditorState {
    return {
        root: {
            children: [
                {
                    children: [],
                    direction: null,
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1,
                    textFormat: 0,
                    textStyle: "",
                } as unknown as SerializedLexicalNode,
            ],
            direction: null,
            format: "",
            indent: 0,
            type: "root",
            version: 1,
        },
    };
}

/**
 * Convert plain string to editor state for migration/backwards compatibility
 */
export function stringToEditorState(text: string): SerializedEditorState {
    if (!text || text.trim() === "") {
        return createEmptyEditorState();
    }

    // Split by newlines and create paragraphs
    const lines = text.split("\n");
    const paragraphs = lines.map((line) => ({
        children: line
            ? [
                  {
                      detail: 0,
                      format: 0,
                      mode: "normal" as const,
                      style: "",
                      text: line,
                      type: "text",
                      version: 1,
                  },
              ]
            : [],
        direction: "ltr" as const,
        format: "" as const,
        indent: 0,
        type: "paragraph",
        version: 1,
        textFormat: 0,
        textStyle: "",
    }));

    return {
        root: {
            children: paragraphs,
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
        },
    };
}

/**
 * Normalize content to SerializedEditorState
 * Converts strings to editor state, passes through editor state as-is
 */
export function normalizeToEditorState(
    content: RichTextContent | undefined | null
): SerializedEditorState {
    if (!content) return createEmptyEditorState();
    if (isSerializedEditorState(content)) return content;
    return stringToEditorState(content);
}

/**
 * Serialize RichTextContent to a string for API storage.
 * - If content is already a string, returns it as-is
 * - If content is a SerializedEditorState, JSON.stringify it
 */
export function serializeRichText(content: RichTextContent | undefined | null): string {
    if (!content) return "";
    if (typeof content === "string") return content;
    return JSON.stringify(content);
}

/**
 * Deserialize a string back to RichTextContent.
 * - If the string is valid JSON with a 'root' property, parse it as SerializedEditorState
 * - Otherwise, return the string as-is (plain text)
 */
export function deserializeRichText(text: string | undefined | null): RichTextContent {
    if (!text) return "";

    // Try to parse as JSON (Lexical editor state)
    if (text.startsWith("{")) {
        try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === "object" && "root" in parsed) {
                return parsed as SerializedEditorState;
            }
        } catch {
            // Not valid JSON, return as plain string
        }
    }

    return text;
}
