"use client";

import { useCallback, useState } from "react";

import { $getSelectionStyleValueForProperty, $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection, BaseSelection } from "lexical";
import { TypeIcon } from "lucide-react";

import { useEditorSize } from "@/components/editor/context/editor-size-context";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const FONT_FAMILY_OPTIONS = [
    "Arial",
    "Verdana",
    "Times New Roman",
    "Georgia",
    "Courier New",
    "Trebuchet MS",
];

export function FontFamilyToolbarPlugin() {
    const style = "font-family";
    const [fontFamily, setFontFamily] = useState("Arial");

    const { activeEditor } = useToolbarContext();
    const sizeConfig = useEditorSize();

    const $updateToolbar = (selection: BaseSelection) => {
        if ($isRangeSelection(selection)) {
            setFontFamily($getSelectionStyleValueForProperty(selection, "font-family", "Arial"));
        }
    };

    useUpdateToolbarHandler($updateToolbar);

    const handleClick = useCallback(
        (option: string) => {
            activeEditor.update(() => {
                const selection = $getSelection();
                if (selection !== null) {
                    $patchStyleText(selection, {
                        [style]: option,
                    });
                }
            });
        },
        [activeEditor, style]
    );

    const triggerHeight =
        sizeConfig.size === "sm" ? "!h-6" : sizeConfig.size === "lg" ? "!h-10" : "!h-8";
    const textSize =
        sizeConfig.size === "sm" ? "text-xs" : sizeConfig.size === "lg" ? "text-base" : "";

    return (
        <Select
            value={fontFamily}
            onValueChange={(value) => {
                setFontFamily(value);
                handleClick(value);
            }}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <SelectTrigger
                        aria-label="Font family"
                        className={`${triggerHeight} w-min gap-1 ${textSize}`}
                    >
                        <TypeIcon className={sizeConfig.iconClass} />
                        <span style={{ fontFamily }}>{fontFamily}</span>
                    </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent>Font Family</TooltipContent>
            </Tooltip>
            <SelectContent
                position="popper"
                sideOffset={5}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                {FONT_FAMILY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option} style={{ fontFamily: option }}>
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
