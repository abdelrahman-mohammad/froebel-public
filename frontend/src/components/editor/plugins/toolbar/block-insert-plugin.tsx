"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { PlusIcon } from "lucide-react";

import { useEditorSize } from "@/components/editor/context/editor-size-context";
import { useEditorModal } from "@/components/editor/editor-hooks/use-modal";
import { Select, SelectContent, SelectGroup, SelectTrigger } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type InsertHandlers = Record<string, () => void>;

const BlockInsertContext = createContext<{
    registerHandler: (value: string, handler: () => void) => void;
} | null>(null);

export function useBlockInsertRegister(value: string, handler: () => void) {
    const context = useContext(BlockInsertContext);

    useEffect(() => {
        if (context) {
            context.registerHandler(value, handler);
        }
    }, [context, value, handler]);
}

export function BlockInsertPlugin({ children }: { children: React.ReactNode }) {
    const [modal] = useEditorModal();
    const sizeConfig = useEditorSize();
    const handlersRef = useRef<InsertHandlers>({});
    const [selectKey, setSelectKey] = useState(0);

    const registerHandler = useCallback((value: string, handler: () => void) => {
        handlersRef.current[value] = handler;
    }, []);

    const handleValueChange = useCallback((value: string) => {
        const handler = handlersRef.current[value];
        if (handler) {
            handler();
        }
        // Reset the select to allow selecting the same option again
        setSelectKey((prev) => prev + 1);
    }, []);

    const triggerHeight =
        sizeConfig.size === "sm" ? "!h-6" : sizeConfig.size === "lg" ? "!h-10" : "!h-8";
    const textSize =
        sizeConfig.size === "sm" ? "text-xs" : sizeConfig.size === "lg" ? "text-base" : "";

    return (
        <BlockInsertContext.Provider value={{ registerHandler }}>
            {modal}
            <Select key={selectKey} value="" onValueChange={handleValueChange}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SelectTrigger
                            aria-label="Insert block"
                            className={`${triggerHeight} w-min gap-1 ${textSize}`}
                        >
                            <PlusIcon className={sizeConfig.iconClass} />
                            <span>Insert</span>
                        </SelectTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Insert Block</TooltipContent>
                </Tooltip>
                <SelectContent
                    position="popper"
                    sideOffset={5}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <SelectGroup>{children}</SelectGroup>
                </SelectContent>
            </Select>
        </BlockInsertContext.Provider>
    );
}
