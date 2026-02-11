"use client";

import { useTheme } from "next-themes";
import dynamic from "next/dynamic";

import "@uiw/react-markdown-preview/markdown.css";
import "@uiw/react-md-editor/markdown-editor.css";

// Dynamic import to avoid SSR issues with the markdown editor
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: number;
    preview?: "live" | "edit" | "preview";
    hideToolbar?: boolean;
    className?: string;
}

export function MarkdownEditor({
    value,
    onChange,
    placeholder = "Write your content here...",
    height = 400,
    preview = "live",
    hideToolbar = false,
    className,
}: MarkdownEditorProps) {
    const { resolvedTheme } = useTheme();

    return (
        <div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"} className={className}>
            <MDEditor
                value={value}
                onChange={(val) => onChange(val || "")}
                preview={preview}
                height={height}
                hideToolbar={hideToolbar}
                textareaProps={{
                    placeholder,
                }}
                visibleDragbar={false}
            />
        </div>
    );
}

// Read-only markdown preview component
const MDPreview = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
    { ssr: false }
);

interface MarkdownPreviewProps {
    content: string;
    className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
    const { resolvedTheme } = useTheme();

    return (
        <div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"} className={className}>
            <MDPreview source={content} />
        </div>
    );
}

export default MarkdownEditor;
