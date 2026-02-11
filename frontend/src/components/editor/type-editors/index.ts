/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Type Editors - Shared question type-specific editor components
 * Used by both QuestionBlock (edit) and CreateQuestionBlock (create)
 * Uses require() for dynamic imports to avoid circular dependencies
 */
import type { Choice, Question } from "@/types/quiz";
import type { RichTextContent } from "@/types/rich-text";

export interface TypeEditorProps {
    question: Question;
    updateField: (field: string, value: unknown) => void;
    addChoice?: () => void;
    removeChoice?: (index: number) => void;
    updateChoice?: (
        index: number,
        field: "text" | "correct",
        value: RichTextContent | boolean
    ) => void;
    /** Unique prefix for radio/checkbox names to avoid conflicts */
    idPrefix?: string;
    /** Field-specific validation errors */
    fieldErrors?: Record<string, string>;
}

export { ChoicesEditor } from "./ChoicesEditor";
export { TrueFalseEditor } from "./TrueFalseEditor";
export { FillBlankEditor } from "./FillBlankEditor";
export { FreeTextEditor } from "./FreeTextEditor";
export { NumericEditor } from "./NumericEditor";
export { FileUploadEditor } from "./FileUploadEditor";

/**
 * Render the appropriate type editor based on question type
 */
export function renderTypeEditor(props: TypeEditorProps): React.ReactNode {
    const { ChoicesEditor } = require("./ChoicesEditor");
    const { TrueFalseEditor } = require("./TrueFalseEditor");
    const { FillBlankEditor } = require("./FillBlankEditor");
    const { FreeTextEditor } = require("./FreeTextEditor");
    const { NumericEditor } = require("./NumericEditor");
    const { FileUploadEditor } = require("./FileUploadEditor");

    switch (props.question.type) {
        case "multiple_choice":
        case "multiple_answer":
        case "dropdown":
            return ChoicesEditor(props);
        case "true_false":
            return TrueFalseEditor(props);
        case "fill_blank":
            return FillBlankEditor(props);
        case "free_text":
            return FreeTextEditor(props);
        case "numeric":
            return NumericEditor(props);
        case "file_upload":
            return FileUploadEditor(props);
        default:
            return null;
    }
}
