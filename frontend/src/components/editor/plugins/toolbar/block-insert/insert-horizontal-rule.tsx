"use client";

import { useCallback } from "react";

import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { ScissorsIcon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useBlockInsertRegister } from "@/components/editor/plugins/toolbar/block-insert-plugin";
import { SelectItem } from "@/components/ui/select";

export function InsertHorizontalRule() {
    const { activeEditor } = useToolbarContext();

    const handleInsert = useCallback(() => {
        activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
    }, [activeEditor]);

    useBlockInsertRegister("horizontal-rule", handleInsert);

    return (
        <SelectItem value="horizontal-rule">
            <div className="flex items-center gap-1">
                <ScissorsIcon className="size-4" />
                <span>Horizontal Rule</span>
            </div>
        </SelectItem>
    );
}
