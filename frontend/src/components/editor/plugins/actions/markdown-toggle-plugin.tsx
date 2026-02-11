"use client";

import { useCallback } from "react";

import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
    $convertFromMarkdownString,
    $convertToMarkdownString,
    Transformer,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getRoot } from "lexical";
import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function MarkdownTogglePlugin({
    shouldPreserveNewLinesInMarkdown,
    transformers,
}: {
    shouldPreserveNewLinesInMarkdown: boolean;
    transformers: Array<Transformer>;
}) {
    const [editor] = useLexicalComposerContext();

    const handleMarkdownToggle = useCallback(() => {
        editor.update(() => {
            const root = $getRoot();
            const firstChild = root.getFirstChild();
            if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
                $convertFromMarkdownString(
                    firstChild.getTextContent(),
                    transformers,
                    undefined, // node
                    shouldPreserveNewLinesInMarkdown
                );
            } else {
                const markdown = $convertToMarkdownString(
                    transformers,
                    undefined, //node
                    shouldPreserveNewLinesInMarkdown
                );
                const codeNode = $createCodeNode("markdown");
                codeNode.append($createTextNode(markdown));
                root.clear().append(codeNode);
                if (markdown.length === 0) {
                    codeNode.select();
                }
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, shouldPreserveNewLinesInMarkdown]);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant={"ghost"}
                    onClick={handleMarkdownToggle}
                    aria-label="Toggle Markdown"
                    size={"sm"}
                    className="p-2"
                >
                    <FileTextIcon className="size-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Markdown</TooltipContent>
        </Tooltip>
    );
}
