"use client";

import * as React from "react";
import { JSX, Suspense } from "react";

import type {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
    SerializedLexicalNode,
    Spread,
} from "lexical";
import { $applyNodeReplacement, DecoratorNode } from "lexical";

const MathComponent = React.lazy(() => import("../editor-ui/math-component"));

export interface MathPayload {
    equation: string;
    inline: boolean;
    key?: NodeKey;
}

export type SerializedMathNode = Spread<
    {
        equation: string;
        inline: boolean;
    },
    SerializedLexicalNode
>;

function $convertMathElement(domNode: Node): null | DOMConversionOutput {
    const element = domNode as HTMLElement;
    const equation = element.getAttribute("data-equation");
    const inline = element.getAttribute("data-inline") === "true";
    if (equation) {
        const node = $createMathNode({ equation, inline });
        return { node };
    }
    return null;
}

export class MathNode extends DecoratorNode<JSX.Element> {
    __equation: string;
    __inline: boolean;

    static getType(): string {
        return "math";
    }

    static clone(node: MathNode): MathNode {
        return new MathNode(node.__equation, node.__inline, node.__key);
    }

    static importJSON(serializedNode: SerializedMathNode): MathNode {
        const { equation, inline } = serializedNode;
        return $createMathNode({ equation, inline });
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement(this.__inline ? "span" : "div");
        element.setAttribute("data-equation", this.__equation);
        element.setAttribute("data-inline", String(this.__inline));
        element.className = "math-node";
        return { element };
    }

    static importDOM(): DOMConversionMap | null {
        return {
            span: (node: Node) => {
                const element = node as HTMLElement;
                if (element.classList.contains("math-node")) {
                    return {
                        conversion: $convertMathElement,
                        priority: 1,
                    };
                }
                return null;
            },
            div: (node: Node) => {
                const element = node as HTMLElement;
                if (element.classList.contains("math-node")) {
                    return {
                        conversion: $convertMathElement,
                        priority: 1,
                    };
                }
                return null;
            },
        };
    }

    constructor(equation: string, inline: boolean, key?: NodeKey) {
        super(key);
        this.__equation = equation;
        this.__inline = inline;
    }

    exportJSON(): SerializedMathNode {
        return {
            equation: this.__equation,
            inline: this.__inline,
            type: "math",
            version: 1,
        };
    }

    getEquation(): string {
        return this.__equation;
    }

    setEquation(equation: string): void {
        const writable = this.getWritable();
        writable.__equation = equation;
    }

    isInline(): boolean {
        return this.__inline;
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement(this.__inline ? "span" : "div");
        const theme = config.theme;
        const className = theme.math;
        if (className !== undefined) {
            element.className = className;
        }
        return element;
    }

    updateDOM(): false {
        return false;
    }

    decorate(): JSX.Element {
        return (
            <Suspense fallback={<span className="text-muted-foreground">Loading math...</span>}>
                <MathComponent
                    equation={this.__equation}
                    inline={this.__inline}
                    nodeKey={this.getKey()}
                />
            </Suspense>
        );
    }
}

export function $createMathNode({ equation, inline, key }: MathPayload): MathNode {
    return $applyNodeReplacement(new MathNode(equation, inline, key));
}

export function $isMathNode(node: LexicalNode | null | undefined): node is MathNode {
    return node instanceof MathNode;
}
