import { JSX, useId } from "react";

import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";

import { cn } from "@/lib/utils";

type Props = {
    placeholder: string;
    className?: string;
    placeholderClassName?: string;
    /** Accessible label for the editor */
    ariaLabel?: string;
};

export function ContentEditable({
    placeholder,
    className,
    placeholderClassName,
    ariaLabel = "Rich text editor",
}: Props): JSX.Element {
    const placeholderId = useId();

    return (
        <LexicalContentEditable
            className={
                className ??
                `ContentEditable__root relative block min-h-72 min-h-full overflow-auto px-8 py-4 focus:outline-none`
            }
            aria-label={ariaLabel}
            aria-placeholder={placeholder}
            aria-describedby={placeholderId}
            aria-multiline={true}
            role="textbox"
            placeholder={
                <div
                    id={placeholderId}
                    className={cn(
                        "text-muted-foreground pointer-events-none absolute top-0 left-0 overflow-hidden text-ellipsis select-none",
                        placeholderClassName ?? "px-8 py-[18px]"
                    )}
                >
                    {placeholder}
                </div>
            }
        />
    );
}
