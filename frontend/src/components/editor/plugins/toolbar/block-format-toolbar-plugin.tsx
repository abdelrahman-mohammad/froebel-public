"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";

import { $isListNode, ListNode } from "@lexical/list";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import { $isRangeSelection, $isRootOrShadowRoot, BaseSelection } from "lexical";

import { useEditorSize } from "@/components/editor/context/editor-size-context";
import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { blockTypeToBlockName } from "@/components/editor/plugins/toolbar/block-format/block-format-data";
import { Select, SelectContent, SelectGroup, SelectTrigger } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type FormatHandlers = Record<string, () => void>;

const BlockFormatContext = createContext<{
    registerHandler: (value: string, handler: () => void) => void;
} | null>(null);

export function useBlockFormatRegister(value: string, handler: () => void) {
    const context = useContext(BlockFormatContext);

    useEffect(() => {
        if (context) {
            context.registerHandler(value, handler);
        }
    }, [context, value, handler]);
}

export function BlockFormatDropDown({ children }: { children: React.ReactNode }) {
    const { activeEditor, blockType, setBlockType } = useToolbarContext();
    const sizeConfig = useEditorSize();
    const handlersRef = useRef<FormatHandlers>({});

    const registerHandler = useCallback((value: string, handler: () => void) => {
        handlersRef.current[value] = handler;
    }, []);

    function $updateToolbar(selection: BaseSelection) {
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === "root"
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                          const parent = e.getParent();
                          return parent !== null && $isRootOrShadowRoot(parent);
                      });

            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = activeEditor.getElementByKey(elementKey);

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
                    const type = parentList ? parentList.getListType() : element.getListType();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element) ? element.getTag() : element.getType();
                    if (type in blockTypeToBlockName) {
                        setBlockType(type as keyof typeof blockTypeToBlockName);
                    }
                }
            }
        }
    }

    useUpdateToolbarHandler($updateToolbar);

    const handleValueChange = useCallback(
        (value: string) => {
            setBlockType(value as keyof typeof blockTypeToBlockName);
            const handler = handlersRef.current[value];
            if (handler) {
                handler();
            }
        },
        [setBlockType]
    );

    const triggerHeight =
        sizeConfig.size === "sm" ? "!h-6" : sizeConfig.size === "lg" ? "!h-10" : "!h-8";
    const textSize =
        sizeConfig.size === "sm" ? "text-xs" : sizeConfig.size === "lg" ? "text-base" : "";

    return (
        <BlockFormatContext.Provider value={{ registerHandler }}>
            <Select value={blockType} onValueChange={handleValueChange}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SelectTrigger
                            aria-label="Block format"
                            className={`${triggerHeight} w-min gap-1 ${textSize} [&_svg]:${sizeConfig.iconClass}`}
                        >
                            {blockTypeToBlockName[blockType].icon}
                            <span>{blockTypeToBlockName[blockType].label}</span>
                        </SelectTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Block Format</TooltipContent>
                </Tooltip>
                <SelectContent
                    position="popper"
                    sideOffset={5}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <SelectGroup>{children}</SelectGroup>
                </SelectContent>
            </Select>
        </BlockFormatContext.Provider>
    );
}
