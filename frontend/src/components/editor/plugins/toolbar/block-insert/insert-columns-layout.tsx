"use client";

import { useCallback } from "react";

import { Columns3Icon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { InsertLayoutDialog } from "@/components/editor/plugins/layout-plugin";
import { useBlockInsertRegister } from "@/components/editor/plugins/toolbar/block-insert-plugin";
import { SelectItem } from "@/components/ui/select";

export function InsertColumnsLayout() {
    const { activeEditor, showModal } = useToolbarContext();

    const handleInsert = useCallback(() => {
        showModal("Insert Columns Layout", (onClose) => (
            <InsertLayoutDialog activeEditor={activeEditor} onClose={onClose} />
        ));
    }, [activeEditor, showModal]);

    useBlockInsertRegister("columns", handleInsert);

    return (
        <SelectItem value="columns">
            <div className="flex items-center gap-1">
                <Columns3Icon className="size-4" />
                <span>Columns Layout</span>
            </div>
        </SelectItem>
    );
}
