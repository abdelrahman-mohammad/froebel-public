"use client";

import { useCallback, useState } from "react";

import { $getSelectionStyleValueForProperty, $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection, BaseSelection } from "lexical";
import { Minus, Plus } from "lucide-react";

import { useEditorSize } from "@/components/editor/context/editor-size-context";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 1;
const MAX_FONT_SIZE = 72;

export function FontSizeToolbarPlugin() {
    const style = "font-size";
    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

    const { activeEditor } = useToolbarContext();
    const sizeConfig = useEditorSize();

    const $updateToolbar = (selection: BaseSelection) => {
        if ($isRangeSelection(selection)) {
            const value = $getSelectionStyleValueForProperty(
                selection,
                "font-size",
                `${DEFAULT_FONT_SIZE}px`
            );
            setFontSize(parseInt(value) || DEFAULT_FONT_SIZE);
        }
    };

    useUpdateToolbarHandler($updateToolbar);

    const updateFontSize = useCallback(
        (newSize: number) => {
            const size = Math.min(Math.max(newSize, MIN_FONT_SIZE), MAX_FONT_SIZE);
            activeEditor.update(() => {
                const selection = $getSelection();
                if (selection !== null) {
                    $patchStyleText(selection, {
                        [style]: `${size}px`,
                    });
                }
            });
            setFontSize(size);
        },
        [activeEditor, style]
    );

    const inputHeight = sizeConfig.size === "sm" ? 24 : sizeConfig.size === "lg" ? 40 : 32;
    const inputClass =
        sizeConfig.size === "sm"
            ? "w-8 text-center text-xs px-1 !py-0"
            : sizeConfig.size === "lg"
              ? "w-14 text-center text-base !py-0"
              : "w-12 text-center !py-0";
    const plusMinusIconClass =
        sizeConfig.size === "sm" ? "size-2" : sizeConfig.size === "lg" ? "size-4" : "size-3";

    return (
        <ButtonGroup>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className={sizeConfig.buttonClass}
                        aria-label="Decrease font size"
                        onClick={() => updateFontSize(fontSize - 1)}
                        disabled={fontSize <= MIN_FONT_SIZE}
                    >
                        <Minus className={plusMinusIconClass} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Decrease font size</TooltipContent>
            </Tooltip>
            <Input
                value={fontSize}
                onChange={(e) => updateFontSize(parseInt(e.target.value) || DEFAULT_FONT_SIZE)}
                className={inputClass}
                style={{ height: inputHeight }}
                min={MIN_FONT_SIZE}
                max={MAX_FONT_SIZE}
                aria-label="Font size"
            />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className={sizeConfig.buttonClass}
                        aria-label="Increase font size"
                        onClick={() => updateFontSize(fontSize + 1)}
                        disabled={fontSize >= MAX_FONT_SIZE}
                    >
                        <Plus className={plusMinusIconClass} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Increase font size</TooltipContent>
            </Tooltip>
        </ButtonGroup>
    );
}
