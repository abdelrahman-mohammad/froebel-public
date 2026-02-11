"use client";

import { FunctionSquareIcon, SigmaIcon } from "lucide-react";

import { ComponentPickerOption } from "@/components/editor/plugins/picker/component-picker-option";
import { InsertMathDialog } from "@/components/editor/plugins/toolbar/block-insert/insert-math";

export function MathInlinePickerPlugin() {
    return new ComponentPickerOption("Inline Math", {
        icon: <FunctionSquareIcon className="size-4" />,
        keywords: ["math", "equation", "latex", "inline", "formula", "katex"],
        onSelect: (_, editor, showModal) =>
            showModal("Insert Inline Math", (onClose) => (
                <InsertMathDialog activeEditor={editor} onClose={onClose} inline={true} />
            )),
    });
}

export function MathBlockPickerPlugin() {
    return new ComponentPickerOption("Block Math", {
        icon: <SigmaIcon className="size-4" />,
        keywords: ["math", "equation", "latex", "block", "formula", "katex", "display"],
        onSelect: (_, editor, showModal) =>
            showModal("Insert Block Math", (onClose) => (
                <InsertMathDialog activeEditor={editor} onClose={onClose} inline={false} />
            )),
    });
}
