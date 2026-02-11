"use client";

import { JSX, useCallback, useState } from "react";

import { LexicalEditor } from "lexical";
import { FunctionSquareIcon, SigmaIcon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { INSERT_MATH_COMMAND } from "@/components/editor/plugins/math-plugin";
import { useBlockInsertRegister } from "@/components/editor/plugins/toolbar/block-insert-plugin";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const EXAMPLE_EQUATIONS = {
    inline: [
        { label: "Pythagorean theorem", value: "a^2 + b^2 = c^2" },
        {
            label: "Quadratic formula",
            value: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
        },
        { label: "Einstein's equation", value: "E = mc^2" },
    ],
    block: [
        {
            label: "Integral",
            value: "\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
        },
        {
            label: "Summation",
            value: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
        },
        {
            label: "Matrix",
            value: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}",
        },
    ],
};

export function InsertMathDialog({
    activeEditor,
    onClose,
    inline = false,
}: {
    activeEditor: LexicalEditor;
    onClose: () => void;
    inline?: boolean;
}): JSX.Element {
    const [equation, setEquation] = useState("");
    const [mode, setMode] = useState<"inline" | "block">(inline ? "inline" : "block");

    const isDisabled = equation.trim() === "";

    const handleInsert = () => {
        if (equation.trim()) {
            activeEditor.dispatchCommand(INSERT_MATH_COMMAND, {
                equation: equation.trim(),
                inline: mode === "inline",
            });
            onClose();
        }
    };

    const examples = mode === "inline" ? EXAMPLE_EQUATIONS.inline : EXAMPLE_EQUATIONS.block;

    return (
        <div className="grid gap-4 py-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "inline" | "block")}>
                <TabsList className="w-full">
                    <TabsTrigger value="inline" className="w-full">
                        <FunctionSquareIcon className="mr-2 size-4" />
                        Inline
                    </TabsTrigger>
                    <TabsTrigger value="block" className="w-full">
                        <SigmaIcon className="mr-2 size-4" />
                        Block
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="inline" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                        Inline math appears within text, like{" "}
                        <code className="bg-muted px-1 rounded">$x^2$</code>
                    </p>
                </TabsContent>
                <TabsContent value="block" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                        Block math is displayed on its own line, centered
                    </p>
                </TabsContent>
            </Tabs>

            <div className="grid gap-2">
                <Label htmlFor="equation">LaTeX Equation</Label>
                <Textarea
                    id="equation"
                    placeholder={
                        mode === "inline" ? "x^2 + y^2 = z^2" : "\\int_{0}^{\\infty} e^{-x^2} dx"
                    }
                    value={equation}
                    onChange={(e) => setEquation(e.target.value)}
                    className="min-h-[80px] font-mono text-sm"
                />
            </div>

            <div className="grid gap-2">
                <Label className="text-muted-foreground text-xs">Examples (click to use)</Label>
                <div className="flex flex-wrap gap-2">
                    {examples.map((example) => (
                        <Button
                            key={example.value}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEquation(example.value)}
                            className="text-xs"
                        >
                            {example.label}
                        </Button>
                    ))}
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isDisabled} onClick={handleInsert}>
                    Insert
                </Button>
            </DialogFooter>
        </div>
    );
}

export function InsertMath() {
    const { activeEditor, showModal } = useToolbarContext();

    const handleInsert = useCallback(() => {
        showModal("Insert Math Equation", (onClose) => (
            <InsertMathDialog activeEditor={activeEditor} onClose={onClose} />
        ));
    }, [activeEditor, showModal]);

    useBlockInsertRegister("math", handleInsert);

    return (
        <SelectItem value="math">
            <div className="flex items-center gap-1">
                <SigmaIcon className="size-4" />
                <span>Math</span>
            </div>
        </SelectItem>
    );
}
