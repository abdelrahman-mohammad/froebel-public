"use client";

import { useCallback, useState } from "react";

import { $isTableSelection } from "@lexical/table";
import { $isRangeSelection, BaseSelection, FORMAT_TEXT_COMMAND, TextFormatType } from "lexical";
import { BoldIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";

import { useEditorSize } from "@/components/editor/context/editor-size-context";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

const FORMATS = [
    { format: "bold", icon: BoldIcon, label: "Bold" },
    { format: "italic", icon: ItalicIcon, label: "Italic" },
    { format: "underline", icon: UnderlineIcon, label: "Underline" },
    {
        format: "strikethrough",
        icon: StrikethroughIcon,
        label: "Strikethrough",
    },
] as const;

export function FontFormatToolbarPlugin() {
    const { activeEditor } = useToolbarContext();
    const sizeConfig = useEditorSize();
    const [activeFormats, setActiveFormats] = useState<string[]>([]);

    const $updateToolbar = useCallback((selection: BaseSelection) => {
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
            const formats: string[] = [];
            FORMATS.forEach(({ format }) => {
                if (selection.hasFormat(format as TextFormatType)) {
                    formats.push(format);
                }
            });
            setActiveFormats((prev) => {
                // Only update if formats have changed
                if (prev.length !== formats.length || !formats.every((f) => prev.includes(f))) {
                    return formats;
                }
                return prev;
            });
        }
    }, []);

    useUpdateToolbarHandler($updateToolbar);

    const handleFormatClick = (format: TextFormatType) => {
        activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    return (
        <ButtonGroup>
            {FORMATS.map(({ format, icon: Icon, label }) => (
                <Tooltip key={format}>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            className={cn(
                                sizeConfig.buttonClass,
                                activeFormats.includes(format) && "bg-accent"
                            )}
                            aria-label={label}
                            onClick={() => handleFormatClick(format as TextFormatType)}
                        >
                            <Icon className={sizeConfig.iconClass} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                </Tooltip>
            ))}
        </ButtonGroup>
    );
}
