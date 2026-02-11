"use client";

import { useCallback } from "react";

import { TableIcon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { InsertTableDialog } from "@/components/editor/plugins/table-plugin";
import { useBlockInsertRegister } from "@/components/editor/plugins/toolbar/block-insert-plugin";
import { SelectItem } from "@/components/ui/select";

export function InsertTable() {
    const { activeEditor, showModal } = useToolbarContext();

    const handleInsert = useCallback(() => {
        showModal("Insert Table", (onClose) => (
            <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
        ));
    }, [activeEditor, showModal]);

    useBlockInsertRegister("table", handleInsert);

    return (
        <SelectItem value="table">
            <div className="flex items-center gap-1">
                <TableIcon className="size-4" />
                <span>Table</span>
            </div>
        </SelectItem>
    );
}
