"use client";

import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_EDITOR,
    LexicalCommand,
    createCommand,
} from "lexical";

import { $createMathNode, MathNode, MathPayload } from "@/components/editor/nodes/math-node";

export const INSERT_MATH_COMMAND: LexicalCommand<MathPayload> =
    createCommand("INSERT_MATH_COMMAND");

export function MathPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([MathNode])) {
            throw new Error("MathPlugin: MathNode not registered on editor");
        }

        return editor.registerCommand<MathPayload>(
            INSERT_MATH_COMMAND,
            (payload) => {
                const { equation, inline } = payload;
                const selection = $getSelection();

                if ($isRangeSelection(selection)) {
                    const mathNode = $createMathNode({ equation, inline });

                    if (inline) {
                        selection.insertNodes([mathNode]);
                    } else {
                        // For block math, wrap in a paragraph if needed
                        const focusNode = selection.focus.getNode();
                        if (focusNode.getTextContent().length === 0) {
                            focusNode.replace(mathNode);
                        } else {
                            selection.insertNodes([mathNode, $createParagraphNode()]);
                        }
                    }
                }

                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
}

export function InsertMathDialog({
    onInsert,
    inline = false,
}: {
    onInsert: (equation: string, inline: boolean) => void;
    inline?: boolean;
}) {
    return null; // This is handled by the toolbar insert plugin
}
