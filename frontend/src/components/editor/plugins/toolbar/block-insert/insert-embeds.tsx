"use client";

import { useCallback } from "react";

import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { EmbedConfigs } from "@/components/editor/plugins/embeds/auto-embed-plugin";
import { useBlockInsertRegister } from "@/components/editor/plugins/toolbar/block-insert-plugin";
import { SelectItem } from "@/components/ui/select";

function InsertEmbedItem({ embedConfig }: { embedConfig: (typeof EmbedConfigs)[number] }) {
    const { activeEditor } = useToolbarContext();

    const handleInsert = useCallback(() => {
        activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type);
    }, [activeEditor, embedConfig.type]);

    useBlockInsertRegister(embedConfig.type, handleInsert);

    return (
        <SelectItem value={embedConfig.type}>
            <div className="flex items-center gap-1">
                {embedConfig.icon}
                <span>{embedConfig.contentName}</span>
            </div>
        </SelectItem>
    );
}

export function InsertEmbeds() {
    return EmbedConfigs.map((embedConfig) => (
        <InsertEmbedItem key={embedConfig.type} embedConfig={embedConfig} />
    ));
}
