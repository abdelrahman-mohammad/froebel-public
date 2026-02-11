import { useCallback } from "react";

import { INSERT_CHECK_LIST_COMMAND } from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode, $getSelection, $isRangeSelection } from "lexical";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useBlockFormatRegister } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data";
import { SelectItem } from "@/components/ui/select";

const BLOCK_FORMAT_VALUE = "check";

export function FormatCheckList() {
    const { activeEditor, blockType } = useToolbarContext();

    const formatCheckList = useCallback(() => {
        if (blockType !== "check") {
            activeEditor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        } else {
            activeEditor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createParagraphNode());
                }
            });
        }
    }, [activeEditor, blockType]);

    useBlockFormatRegister(BLOCK_FORMAT_VALUE, formatCheckList);

    return (
        <SelectItem value={BLOCK_FORMAT_VALUE}>
            <div className="flex items-center gap-1 font-normal">
                {blockTypeToBlockName[BLOCK_FORMAT_VALUE].icon}
                {blockTypeToBlockName[BLOCK_FORMAT_VALUE].label}
            </div>
        </SelectItem>
    );
}
