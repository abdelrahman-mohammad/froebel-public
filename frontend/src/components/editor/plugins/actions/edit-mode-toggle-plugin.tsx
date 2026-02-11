"use client";

import { useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EyeIcon, PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function EditModeTogglePlugin() {
    const [editor] = useLexicalComposerContext();
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={"ghost"}
                    onClick={() => {
                        editor.setEditable(!editor.isEditable());
                        setIsEditable(editor.isEditable());
                    }}
                    aria-label={isEditable ? "Switch to View Only" : "Switch to Edit Mode"}
                    size={"sm"}
                    className="p-2"
                >
                    {isEditable ? (
                        <PencilIcon className="size-4" />
                    ) : (
                        <EyeIcon className="size-4" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{isEditable ? "View Only Mode" : "Edit Mode"}</TooltipContent>
        </Tooltip>
    );
}
