"use client";

import { useState } from "react";

import { $isLinkNode } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import {
    $isElementNode,
    $isRangeSelection,
    BaseSelection,
    ElementFormatType,
    FORMAT_ELEMENT_COMMAND,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
} from "lexical";
import {
    AlignCenterIcon,
    AlignJustifyIcon,
    AlignLeftIcon,
    AlignRightIcon,
    IndentDecreaseIcon,
    IndentIncreaseIcon,
    LucideIcon,
} from "lucide-react";

import { useEditorSize } from "@/components/editor/context/editor-size-context";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { getSelectedNode } from "@/components/editor/utils/get-selected-node";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

const ELEMENT_FORMAT_OPTIONS: {
    [key in Exclude<ElementFormatType, "start" | "end" | "">]: {
        Icon: LucideIcon;
        iconRTL: string;
        name: string;
    };
} = {
    left: {
        Icon: AlignLeftIcon,
        iconRTL: "left-align",
        name: "Left Align",
    },
    center: {
        Icon: AlignCenterIcon,
        iconRTL: "center-align",
        name: "Center Align",
    },
    right: {
        Icon: AlignRightIcon,
        iconRTL: "right-align",
        name: "Right Align",
    },
    justify: {
        Icon: AlignJustifyIcon,
        iconRTL: "justify-align",
        name: "Justify Align",
    },
} as const;

export function ElementFormatToolbarPlugin({ separator = true }: { separator?: boolean }) {
    const { activeEditor } = useToolbarContext();
    const sizeConfig = useEditorSize();
    const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");

    const $updateToolbar = (selection: BaseSelection) => {
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();

            let matchingParent;
            if ($isLinkNode(parent)) {
                // If node is a link, we need to fetch the parent paragraph node to set format
                matchingParent = $findMatchingParent(
                    node,
                    (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
                );
            }
            setElementFormat(
                $isElementNode(matchingParent)
                    ? matchingParent.getFormatType()
                    : $isElementNode(node)
                      ? node.getFormatType()
                      : parent?.getFormatType() || "left"
            );
        }
    };

    useUpdateToolbarHandler($updateToolbar);

    const handleAlignmentClick = (format: ElementFormatType) => {
        setElementFormat(format);
        activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
    };

    const handleIndent = () => {
        activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    };

    const handleOutdent = () => {
        activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    };

    return (
        <>
            <ButtonGroup>
                {Object.entries(ELEMENT_FORMAT_OPTIONS).map(([value, option]) => (
                    <Tooltip key={value}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                className={cn(
                                    sizeConfig.buttonClass,
                                    elementFormat === value && "bg-accent"
                                )}
                                aria-label={option.name}
                                onClick={() => handleAlignmentClick(value as ElementFormatType)}
                            >
                                <option.Icon className={sizeConfig.iconClass} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{option.name}</TooltipContent>
                    </Tooltip>
                ))}
            </ButtonGroup>
            {separator && (
                <Separator orientation="vertical" className={sizeConfig.separatorHeight} />
            )}
            <ButtonGroup>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            className={sizeConfig.buttonClass}
                            aria-label="Outdent"
                            onClick={handleOutdent}
                        >
                            <IndentDecreaseIcon className={sizeConfig.iconClass} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Outdent</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            className={sizeConfig.buttonClass}
                            aria-label="Indent"
                            onClick={handleIndent}
                        >
                            <IndentIncreaseIcon className={sizeConfig.iconClass} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Indent</TooltipContent>
                </Tooltip>
            </ButtonGroup>
        </>
    );
}
