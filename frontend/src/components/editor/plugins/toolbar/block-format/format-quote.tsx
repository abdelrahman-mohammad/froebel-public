import { useCallback } from "react";

import { $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection } from "lexical";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useBlockFormatRegister } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data";
import { SelectItem } from "@/components/ui/select";

const BLOCK_FORMAT_VALUE = "quote";

export function FormatQuote() {
    const { activeEditor, blockType } = useToolbarContext();

    const formatQuote = useCallback(() => {
        if (blockType !== "quote") {
            activeEditor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createQuoteNode());
            });
        }
    }, [activeEditor, blockType]);

    useBlockFormatRegister(BLOCK_FORMAT_VALUE, formatQuote);

    return (
        <SelectItem value={BLOCK_FORMAT_VALUE}>
            <div className="flex items-center gap-1 font-normal">
                {blockTypeToBlockName[BLOCK_FORMAT_VALUE].icon}
                {blockTypeToBlockName[BLOCK_FORMAT_VALUE].label}
            </div>
        </SelectItem>
    );
}
