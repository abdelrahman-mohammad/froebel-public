"use client";

import { useCallback, useEffect, useState } from "react";

import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
    $isRangeSelection,
    BaseSelection,
    COMMAND_PRIORITY_NORMAL,
    KEY_MODIFIER_COMMAND,
} from "lexical";
import { LinkIcon } from "lucide-react";

import { useEditorSize } from "@/components/editor/context/editor-size-context";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { getSelectedNode } from "@/components/editor/utils/get-selected-node";
import { sanitizeUrl } from "@/components/editor/utils/url";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

export function LinkToolbarPlugin({
    setIsLinkEditMode,
}: {
    setIsLinkEditMode: (isEditMode: boolean) => void;
}) {
    const { activeEditor } = useToolbarContext();
    const sizeConfig = useEditorSize();
    const [isLink, setIsLink] = useState(false);

    const $updateToolbar = (selection: BaseSelection) => {
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true);
            } else {
                setIsLink(false);
            }
        }
    };

    useUpdateToolbarHandler($updateToolbar);

    useEffect(() => {
        return activeEditor.registerCommand(
            KEY_MODIFIER_COMMAND,
            (payload) => {
                const event: KeyboardEvent = payload;
                const { code, ctrlKey, metaKey } = event;

                if (code === "KeyK" && (ctrlKey || metaKey)) {
                    event.preventDefault();
                    let url: string | null;
                    if (!isLink) {
                        setIsLinkEditMode(true);
                        url = sanitizeUrl("https://");
                    } else {
                        setIsLinkEditMode(false);
                        url = null;
                    }
                    return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                }
                return false;
            },
            COMMAND_PRIORITY_NORMAL
        );
    }, [activeEditor, isLink, setIsLinkEditMode]);

    const insertLink = useCallback(() => {
        if (!isLink) {
            setIsLinkEditMode(true);
            activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
        } else {
            setIsLinkEditMode(false);
            activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [activeEditor, isLink, setIsLinkEditMode]);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    size="icon-sm"
                    className={cn(sizeConfig.buttonClass, isLink && "bg-accent")}
                    aria-label="Insert Link"
                    onClick={insertLink}
                >
                    <LinkIcon className={sizeConfig.iconClass} />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
        </Tooltip>
    );
}
