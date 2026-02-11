import type { TextMatchTransformer } from "@lexical/markdown";
import { $createTextNode, $isTextNode, LexicalNode } from "lexical";

import { $createMathNode, $isMathNode, MathNode } from "@/components/editor/nodes/math-node";

// Block math: $$...$$
export const BLOCK_MATH: TextMatchTransformer = {
    dependencies: [MathNode],
    export: (node: LexicalNode) => {
        if (!$isMathNode(node)) {
            return null;
        }
        if (node.isInline()) {
            return null;
        }
        return `$$${node.getEquation()}$$`;
    },
    importRegExp: /\$\$([^$]+)\$\$/,
    regExp: /\$\$([^$]+)\$\$$/,
    replace: (textNode, match) => {
        const equation = match[1].trim();
        const mathNode = $createMathNode({ equation, inline: false });
        textNode.replace(mathNode);
    },
    trigger: "$",
    type: "text-match",
};

// Inline math: $...$
export const INLINE_MATH: TextMatchTransformer = {
    dependencies: [MathNode],
    export: (node: LexicalNode) => {
        if (!$isMathNode(node)) {
            return null;
        }
        if (!node.isInline()) {
            return null;
        }
        return `$${node.getEquation()}$`;
    },
    importRegExp: /\$([^$]+)\$/,
    regExp: /\$([^$]+)\$$/,
    replace: (textNode, match) => {
        const equation = match[1].trim();
        // Avoid matching block math ($$...$$)
        if (equation.startsWith("$") || equation.endsWith("$")) {
            return;
        }
        const mathNode = $createMathNode({ equation, inline: true });
        textNode.replace(mathNode);
    },
    trigger: "$",
    type: "text-match",
};
