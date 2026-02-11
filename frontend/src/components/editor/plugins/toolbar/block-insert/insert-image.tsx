"use client";

import { useCallback } from "react";

import { ImageIcon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { InsertImageDialog } from "@/components/editor/plugins/images-plugin";
import { useBlockInsertRegister } from "@/components/editor/plugins/toolbar/block-insert-plugin";
import { SelectItem } from "@/components/ui/select";

export function InsertImage() {
    const { activeEditor, showModal } = useToolbarContext();

    const handleInsert = useCallback(() => {
        showModal("Insert Image", (onClose) => (
            <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
        ));
    }, [activeEditor, showModal]);

    useBlockInsertRegister("image", handleInsert);

    return (
        <SelectItem value="image">
            <div className="flex items-center gap-1">
                <ImageIcon className="size-4" />
                <span>Image</span>
            </div>
        </SelectItem>
    );
}
