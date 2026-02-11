"use client";

import { SerializedEditorState } from "lexical";

import { Editor, type EditorProps } from "@/components/blocks/editor-x/editor";
import type { EditorSize } from "@/components/editor/context/editor-size-context";

import { cn } from "@/lib/utils";

import { RichTextContent, isSerializedEditorState, stringToEditorState } from "@/types/rich-text";

interface RichTextEditorProps {
    value: RichTextContent | undefined;
    onChange: (value: SerializedEditorState) => void;
    size?: EditorSize;
    resizable?: boolean;
    className?: string;
    /** Maximum character limit */
    maxLength?: number;
    /** Auto-focus the editor on mount */
    autoFocus?: boolean;
    /** Hide specific action buttons */
    hideActions?: EditorProps["hideActions"];
}

/**
 * Rich text editor wrapper for quiz editor fields.
 * Handles conversion of plain strings to editor state for backwards compatibility.
 */
export function RichTextEditor({
    value,
    onChange,
    size = "sm",
    resizable = false,
    className,
    maxLength,
    autoFocus = false,
    hideActions,
}: RichTextEditorProps) {
    // Convert string to editor state if needed (migration support)
    const editorState: SerializedEditorState | undefined = isSerializedEditorState(value)
        ? value
        : typeof value === "string" && value
          ? stringToEditorState(value)
          : undefined;

    return (
        <div className={cn(className)}>
            <Editor
                editorSerializedState={editorState}
                onSerializedChange={onChange}
                size={size}
                resizable={resizable}
                maxLength={maxLength}
                autoFocus={autoFocus}
                hideActions={hideActions}
            />
        </div>
    );
}
