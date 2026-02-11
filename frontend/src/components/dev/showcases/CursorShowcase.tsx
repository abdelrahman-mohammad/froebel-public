"use client";

import Image from "next/image";

import { Loader2 } from "lucide-react";

import { ShowcaseItem } from "../ShowcaseItem";

const CURSORS = [
    {
        name: "Default",
        className: "",
        file: "pointer.cur",
        description: "Normal browsing",
        animated: false,
    },
    {
        name: "Pointer",
        className: "cursor-pointer",
        file: "link.cur",
        description: "Clickable elements",
        animated: false,
    },
    {
        name: "Text",
        className: "cursor-text",
        file: "text.cur",
        description: "Text inputs",
        animated: false,
    },
    {
        name: "Help",
        className: "cursor-help",
        file: "help.cur",
        description: "Help tooltips",
        animated: false,
    },
    {
        name: "Not Allowed",
        className: "cursor-not-allowed",
        file: "unavailable.cur",
        description: "Disabled elements",
        animated: false,
    },
    {
        name: "Wait",
        className: "cursor-wait",
        file: "busy.ani",
        description: "Loading state",
        animated: true,
    },
    {
        name: "Progress",
        className: "cursor-progress",
        file: "working.ani",
        description: "Background activity",
        animated: true,
    },
    {
        name: "Move",
        className: "cursor-move",
        file: "move.cur",
        description: "Draggable elements",
        animated: false,
    },
    {
        name: "EW Resize",
        className: "cursor-ew-resize",
        file: "horz.cur",
        description: "Horizontal resize",
        animated: false,
    },
    {
        name: "NS Resize",
        className: "cursor-ns-resize",
        file: "vert.cur",
        description: "Vertical resize",
        animated: false,
    },
    {
        name: "NESW Resize",
        className: "cursor-nesw-resize",
        file: "dgn1.cur",
        description: "Diagonal NE-SW",
        animated: false,
    },
    {
        name: "NWSE Resize",
        className: "cursor-nwse-resize",
        file: "dgn2.cur",
        description: "Diagonal NW-SE",
        animated: false,
    },
    {
        name: "Crosshair",
        className: "cursor-crosshair",
        file: "precision.cur",
        description: "Precision select",
        animated: false,
    },
    {
        name: "Grab",
        className: "cursor-grab",
        file: "alternate.cur",
        description: "Grabbable element",
        animated: false,
    },
    {
        name: "Grabbing",
        className: "cursor-grabbing",
        file: "move.cur",
        description: "Currently grabbing",
        animated: false,
    },
];

export function CursorShowcase() {
    return (
        <ShowcaseItem
            title="Cursors"
            description="Custom cursor set - hover over each card to preview the cursor"
        >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {CURSORS.map((cursor) => (
                    <div
                        key={cursor.name}
                        className={`
              group relative flex flex-col items-center justify-center gap-2
              p-4 min-h-[120px] rounded-lg border-2 border-border bg-card
              transition-all duration-200 hover:border-primary hover:bg-muted
              ${cursor.className}
            `}
                    >
                        {/* Cursor preview image */}
                        <div className="w-8 h-8 flex items-center justify-center">
                            {cursor.animated ? (
                                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                            ) : (
                                <Image
                                    src={`/cursors/${cursor.file}`}
                                    alt={cursor.name}
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                    unoptimized
                                />
                            )}
                        </div>

                        {/* Cursor name */}
                        <span className="text-sm font-medium text-foreground text-center">
                            {cursor.name}
                        </span>

                        {/* CSS class */}
                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {cursor.className || "(default)"}
                        </code>

                        {/* Description tooltip on hover */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <div className="bg-foreground text-background text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                {cursor.description}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Instructions */}
            <p className="mt-4 text-sm text-muted-foreground text-center">
                Hover over each card to see the custom cursor in action. The image shows the
                expected cursor appearance.
            </p>
        </ShowcaseItem>
    );
}
