import { useCallback } from "react";

import { $createHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $getSelection } from "lexical";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useBlockFormatRegister } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin";
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data";
import { SelectItem } from "@/components/ui/select";

function FormatHeadingItem({ level }: { level: HeadingTagType }) {
    const { activeEditor, blockType } = useToolbarContext();

    const formatHeading = useCallback(() => {
        if (blockType !== level) {
            activeEditor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createHeadingNode(level));
            });
        }
    }, [activeEditor, blockType, level]);

    useBlockFormatRegister(level, formatHeading);

    return (
        <SelectItem value={level}>
            <div className="flex items-center gap-1 font-normal">
                {blockTypeToBlockName[level].icon}
                {blockTypeToBlockName[level].label}
            </div>
        </SelectItem>
    );
}

export function FormatHeading({ levels = [] }: { levels: HeadingTagType[] }) {
    return levels.map((level) => <FormatHeadingItem key={level} level={level} />);
}
