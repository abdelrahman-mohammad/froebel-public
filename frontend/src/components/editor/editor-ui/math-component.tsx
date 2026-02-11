"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// Lexical math component with state sync patterns
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
    NodeKey,
} from "lexical";

import { $isMathNode } from "@/components/editor/nodes/math-node";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

interface MathComponentProps {
    equation: string;
    inline: boolean;
    nodeKey: NodeKey;
}

export default function MathComponent({ equation, inline, nodeKey }: MathComponentProps) {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const [isEditing, setIsEditing] = useState(false);
    const [editedEquation, setEditedEquation] = useState(equation);
    const [renderError, setRenderError] = useState<string | null>(null);
    const mathRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const renderMath = useCallback(() => {
        if (mathRef.current) {
            try {
                katex.render(equation, mathRef.current, {
                    displayMode: !inline,
                    throwOnError: false,
                    errorColor: "#ef4444",
                });
                setRenderError(null);
            } catch (error) {
                // Clear the element and set error state
                mathRef.current.textContent = "";
                setRenderError(`Invalid LaTeX: ${equation}`);
            }
        }
    }, [equation, inline]);

    useEffect(() => {
        renderMath();
    }, [renderMath]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = useCallback(() => {
        if (editedEquation.trim() !== equation) {
            editor.update(() => {
                const node = $getNodeByKey(nodeKey);
                if ($isMathNode(node)) {
                    node.setEquation(editedEquation.trim());
                }
            });
        }
        setIsEditing(false);
    }, [editor, editedEquation, equation, nodeKey]);

    const handleCancel = useCallback(() => {
        setEditedEquation(equation);
        setIsEditing(false);
    }, [equation]);

    const handleDelete = useCallback(() => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isMathNode(node)) {
                node.remove();
            }
        });
    }, [editor, nodeKey]);

    useEffect(() => {
        return mergeRegister(
            editor.registerCommand<MouseEvent>(
                CLICK_COMMAND,
                (event) => {
                    const target = event.target as HTMLElement;
                    if (mathRef.current?.contains(target)) {
                        if (!event.shiftKey) {
                            clearSelection();
                        }
                        setSelected(true);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                () => {
                    if (isSelected && $isNodeSelection($getSelection())) {
                        handleDelete();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                () => {
                    if (isSelected && $isNodeSelection($getSelection())) {
                        handleDelete();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_ENTER_COMMAND,
                () => {
                    if (isSelected && !isEditing) {
                        setIsEditing(true);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    if (isEditing) {
                        handleCancel();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW
            )
        );
    }, [editor, isSelected, isEditing, handleDelete, handleCancel, clearSelection, setSelected]);

    if (isEditing) {
        return (
            <div
                className={cn(
                    "relative rounded-md border bg-muted/50 p-2",
                    inline ? "inline-block" : "my-2"
                )}
            >
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                        LaTeX Equation {inline ? "(inline)" : "(block)"}
                    </label>
                    <Textarea
                        ref={inputRef}
                        value={editedEquation}
                        onChange={(e) => setEditedEquation(e.target.value)}
                        placeholder={
                            inline
                                ? "x^2 + y^2 = z^2"
                                : "\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}"
                        }
                        className="min-h-[60px] font-mono text-sm"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault();
                                handleSave();
                            }
                        }}
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave}>
                            Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "cursor-pointer rounded transition-colors",
                inline ? "inline-block px-1" : "my-2 py-2 text-center",
                isSelected && "ring-2 ring-primary ring-offset-2"
            )}
            onDoubleClick={() => setIsEditing(true)}
            title="Double-click to edit"
        >
            {renderError ? (
                <span className="text-destructive text-sm">{renderError}</span>
            ) : (
                <div ref={mathRef} />
            )}
        </div>
    );
}
