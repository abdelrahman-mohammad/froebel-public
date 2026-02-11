"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// Toolbar plugin with state updates
import { useState } from "react";

import { $isTableSelection } from "@lexical/table";
import { $isRangeSelection, BaseSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { SubscriptIcon, SuperscriptIcon } from "lucide-react";

import { useEditorSize } from "@/components/editor/context/editor-size-context";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

export function SubSuperToolbarPlugin() {
    const { activeEditor } = useToolbarContext();
    const sizeConfig = useEditorSize();
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);

    const $updateToolbar = (selection: BaseSelection) => {
        if ($isRangeSelection(selection) || $isTableSelection(selection)) {
            setIsSubscript(selection.hasFormat("subscript"));
            setIsSuperscript(selection.hasFormat("superscript"));
        }
    };

    useUpdateToolbarHandler($updateToolbar);

    return (
        <ButtonGroup>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className={cn(sizeConfig.buttonClass, isSubscript && "bg-accent")}
                        aria-label="Subscript"
                        onClick={() => {
                            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
                        }}
                    >
                        <SubscriptIcon className={sizeConfig.iconClass} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Subscript</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        className={cn(sizeConfig.buttonClass, isSuperscript && "bg-accent")}
                        aria-label="Superscript"
                        onClick={() => {
                            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
                        }}
                    >
                        <SuperscriptIcon className={sizeConfig.iconClass} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Superscript</TooltipContent>
            </Tooltip>
        </ButtonGroup>
    );
}
