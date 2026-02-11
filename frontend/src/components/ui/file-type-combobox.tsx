"use client";

import * as React from "react";
import { useMemo, useState } from "react";

import { Check, ChevronsUpDown, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

// Predefined file type options grouped by category
const FILE_TYPE_OPTIONS = [
    // Documents
    { value: ".pdf", label: "PDF", category: "Documents" },
    { value: ".doc,.docx", label: "Word", category: "Documents" },
    { value: ".xls,.xlsx", label: "Excel", category: "Documents" },
    { value: ".ppt,.pptx", label: "PowerPoint", category: "Documents" },
    { value: ".txt", label: "Plain Text", category: "Documents" },
    { value: ".rtf", label: "Rich Text", category: "Documents" },
    { value: ".odt", label: "OpenDocument Text", category: "Documents" },
    { value: ".ods", label: "OpenDocument Spreadsheet", category: "Documents" },
    {
        value: ".odp",
        label: "OpenDocument Presentation",
        category: "Documents",
    },
    { value: ".csv", label: "CSV", category: "Documents" },
    { value: ".md", label: "Markdown", category: "Documents" },

    // Images
    { value: "image/*", label: "All Images", category: "Images" },
    { value: ".png", label: "PNG", category: "Images" },
    { value: ".jpg,.jpeg", label: "JPEG", category: "Images" },
    { value: ".gif", label: "GIF", category: "Images" },
    { value: ".svg", label: "SVG", category: "Images" },
    { value: ".webp", label: "WebP", category: "Images" },
    { value: ".avif", label: "AVIF", category: "Images" },
    { value: ".bmp", label: "BMP", category: "Images" },
    { value: ".tiff,.tif", label: "TIFF", category: "Images" },
    { value: ".ico", label: "ICO", category: "Images" },
    { value: ".heic,.heif", label: "HEIC/HEIF", category: "Images" },
    { value: ".psd", label: "Photoshop", category: "Images" },
    { value: ".ai", label: "Illustrator", category: "Images" },
    { value: ".raw,.cr2,.nef,.arw", label: "RAW", category: "Images" },

    // Audio
    { value: "audio/*", label: "All Audio", category: "Audio" },
    { value: ".mp3", label: "MP3", category: "Audio" },
    { value: ".wav", label: "WAV", category: "Audio" },
    { value: ".aac", label: "AAC", category: "Audio" },
    { value: ".flac", label: "FLAC", category: "Audio" },
    { value: ".ogg", label: "OGG", category: "Audio" },
    { value: ".m4a", label: "M4A", category: "Audio" },
    { value: ".wma", label: "WMA", category: "Audio" },
    { value: ".aiff,.aif", label: "AIFF", category: "Audio" },
    { value: ".midi,.mid", label: "MIDI", category: "Audio" },

    // Video
    { value: "video/*", label: "All Video", category: "Video" },
    { value: ".mp4", label: "MP4", category: "Video" },
    { value: ".webm", label: "WebM", category: "Video" },
    { value: ".mov", label: "MOV", category: "Video" },
    { value: ".avi", label: "AVI", category: "Video" },
    { value: ".mkv", label: "MKV", category: "Video" },
    { value: ".wmv", label: "WMV", category: "Video" },
    { value: ".flv", label: "FLV", category: "Video" },
    { value: ".m4v", label: "M4V", category: "Video" },
    { value: ".mpeg,.mpg", label: "MPEG", category: "Video" },

    // Archives
    { value: ".zip", label: "ZIP", category: "Archives" },
    { value: ".rar", label: "RAR", category: "Archives" },
    { value: ".7z", label: "7-Zip", category: "Archives" },
    { value: ".tar", label: "TAR", category: "Archives" },
    { value: ".gz,.gzip", label: "GZIP", category: "Archives" },
    { value: ".tar.gz,.tgz", label: "TAR.GZ", category: "Archives" },
    { value: ".bz2", label: "BZIP2", category: "Archives" },

    // Code
    { value: ".js,.mjs", label: "JavaScript", category: "Code" },
    { value: ".ts,.tsx", label: "TypeScript", category: "Code" },
    { value: ".jsx", label: "JSX", category: "Code" },
    { value: ".vue", label: "Vue", category: "Code" },
    { value: ".svelte", label: "Svelte", category: "Code" },
    { value: ".py", label: "Python", category: "Code" },
    { value: ".java", label: "Java", category: "Code" },
    { value: ".c,.h", label: "C", category: "Code" },
    { value: ".cpp,.hpp,.cc,.cxx", label: "C++", category: "Code" },
    { value: ".cs", label: "C#", category: "Code" },
    { value: ".fs,.fsx", label: "F#", category: "Code" },
    { value: ".go", label: "Go", category: "Code" },
    { value: ".rs", label: "Rust", category: "Code" },
    { value: ".rb,.erb", label: "Ruby", category: "Code" },
    { value: ".php", label: "PHP", category: "Code" },
    { value: ".swift", label: "Swift", category: "Code" },
    { value: ".kt,.kts", label: "Kotlin", category: "Code" },
    { value: ".scala,.sc", label: "Scala", category: "Code" },
    { value: ".dart", label: "Dart", category: "Code" },
    { value: ".lua", label: "Lua", category: "Code" },
    { value: ".pl,.pm", label: "Perl", category: "Code" },
    { value: ".r,.R", label: "R", category: "Code" },
    { value: ".jl", label: "Julia", category: "Code" },
    { value: ".ex,.exs", label: "Elixir", category: "Code" },
    { value: ".erl,.hrl", label: "Erlang", category: "Code" },
    { value: ".hs,.lhs", label: "Haskell", category: "Code" },
    { value: ".clj,.cljs,.cljc", label: "Clojure", category: "Code" },
    { value: ".ml,.mli", label: "OCaml", category: "Code" },
    { value: ".m,.mm", label: "Objective-C", category: "Code" },
    { value: ".groovy,.gvy", label: "Groovy", category: "Code" },
    { value: ".html,.htm", label: "HTML", category: "Code" },
    { value: ".css", label: "CSS", category: "Code" },
    { value: ".scss,.sass", label: "SASS/SCSS", category: "Code" },
    { value: ".less", label: "Less", category: "Code" },
    { value: ".sql", label: "SQL", category: "Code" },
    { value: ".sh,.bash,.zsh", label: "Shell Script", category: "Code" },
    { value: ".ps1,.psm1,.psd1", label: "PowerShell", category: "Code" },
    { value: ".bat,.cmd", label: "Batch", category: "Code" },
    { value: ".asm,.s", label: "Assembly", category: "Code" },
    { value: ".coffee", label: "CoffeeScript", category: "Code" },
    { value: ".elm", label: "Elm", category: "Code" },
    { value: ".purs", label: "PureScript", category: "Code" },
    { value: ".re,.rei", label: "ReasonML", category: "Code" },
    { value: ".res,.resi", label: "ReScript", category: "Code" },
    { value: ".zig", label: "Zig", category: "Code" },
    { value: ".nim", label: "Nim", category: "Code" },
    { value: ".cr", label: "Crystal", category: "Code" },
    { value: ".d", label: "D", category: "Code" },
    { value: ".pas,.pp", label: "Pascal", category: "Code" },
    { value: ".adb,.ads", label: "Ada", category: "Code" },
    { value: ".f,.f90,.f95,.for", label: "Fortran", category: "Code" },
    { value: ".cob,.cbl", label: "COBOL", category: "Code" },
    { value: ".lisp,.lsp,.cl", label: "Common Lisp", category: "Code" },
    { value: ".scm,.ss,.rkt", label: "Scheme/Racket", category: "Code" },
    { value: ".tcl", label: "Tcl", category: "Code" },
    { value: ".awk", label: "AWK", category: "Code" },
    { value: ".sol", label: "Solidity", category: "Code" },
    { value: ".vy", label: "Vyper", category: "Code" },
    { value: ".move", label: "Move", category: "Code" },
    { value: ".wasm,.wat", label: "WebAssembly", category: "Code" },
    { value: ".graphql,.gql", label: "GraphQL", category: "Code" },
    { value: ".prisma", label: "Prisma", category: "Code" },
    { value: ".proto", label: "Protocol Buffers", category: "Code" },
    { value: ".thrift", label: "Thrift", category: "Code" },
    { value: ".tf,.tfvars", label: "Terraform", category: "Code" },
    { value: ".hcl", label: "HCL", category: "Code" },
    { value: ".nix", label: "Nix", category: "Code" },
    { value: ".glsl,.vert,.frag", label: "GLSL", category: "Code" },
    { value: ".hlsl", label: "HLSL", category: "Code" },
    { value: ".wgsl", label: "WGSL", category: "Code" },
    { value: ".cu,.cuh", label: "CUDA", category: "Code" },
    { value: ".opencl,.cl", label: "OpenCL", category: "Code" },
    { value: ".v,.vh", label: "Verilog", category: "Code" },
    { value: ".vhd,.vhdl", label: "VHDL", category: "Code" },
    { value: ".astro", label: "Astro", category: "Code" },
    { value: ".mdx", label: "MDX", category: "Code" },

    // Data
    { value: ".json", label: "JSON", category: "Data" },
    { value: ".xml", label: "XML", category: "Data" },
    { value: ".yaml,.yml", label: "YAML", category: "Data" },
    { value: ".toml", label: "TOML", category: "Data" },
    { value: ".ini,.cfg,.conf", label: "Config", category: "Data" },

    // Ebooks
    { value: ".epub", label: "EPUB", category: "Ebooks" },
    { value: ".mobi", label: "MOBI", category: "Ebooks" },
    { value: ".azw,.azw3", label: "Kindle", category: "Ebooks" },

    // Fonts
    { value: ".ttf", label: "TrueType", category: "Fonts" },
    { value: ".otf", label: "OpenType", category: "Fonts" },
    { value: ".woff,.woff2", label: "Web Font", category: "Fonts" },
    { value: ".eot", label: "EOT", category: "Fonts" },

    // 3D & CAD
    { value: ".obj", label: "OBJ", category: "3D & CAD" },
    { value: ".fbx", label: "FBX", category: "3D & CAD" },
    { value: ".stl", label: "STL", category: "3D & CAD" },
    { value: ".gltf,.glb", label: "glTF", category: "3D & CAD" },
    { value: ".blend", label: "Blender", category: "3D & CAD" },
    { value: ".dae", label: "Collada", category: "3D & CAD" },
    { value: ".dwg", label: "AutoCAD", category: "3D & CAD" },
    { value: ".dxf", label: "DXF", category: "3D & CAD" },
    { value: ".skp", label: "SketchUp", category: "3D & CAD" },
];

interface FileTypeComboboxProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    allowCustom?: boolean;
}

export function FileTypeCombobox({
    value,
    onChange,
    placeholder = "Select file types...",
    className,
    allowCustom = false,
}: FileTypeComboboxProps) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [search, setSearch] = useState("");

    const maxShownItems = 2;
    const visibleItems = expanded ? value : value.slice(0, maxShownItems);
    const hiddenCount = value.length - visibleItems.length;

    const toggleSelection = (fileType: string) => {
        onChange(
            value.includes(fileType) ? value.filter((v) => v !== fileType) : [...value, fileType]
        );
    };

    const removeSelection = (fileType: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== fileType));
    };

    const addCustomExtension = (ext: string) => {
        // Normalize the extension (ensure it starts with a dot)
        const normalized = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
        if (!value.includes(normalized)) {
            onChange([...value, normalized]);
        }
        setSearch("");
    };

    // Group options by category
    const groupedOptions = useMemo(() => {
        const groups = new Map<string, typeof FILE_TYPE_OPTIONS>();
        FILE_TYPE_OPTIONS.forEach((opt) => {
            const group = groups.get(opt.category) || [];
            group.push(opt);
            groups.set(opt.category, group);
        });
        return groups;
    }, []);

    // Find label for a value
    const getLabel = (val: string) => FILE_TYPE_OPTIONS.find((o) => o.value === val)?.label || val;

    // Check if search looks like a valid extension and isn't already in predefined list
    const isValidCustomExtension = useMemo(() => {
        if (!allowCustom || !search) return false;
        const trimmed = search.trim().toLowerCase();
        // Must look like an extension (starts with . or is just letters/numbers)
        const extPattern = /^\.?[a-z0-9]+$/i;
        if (!extPattern.test(trimmed)) return false;
        const normalized = trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
        // Check if it already exists in predefined options
        const existsInPredefined = FILE_TYPE_OPTIONS.some((opt) =>
            opt.value.split(",").some((ext) => ext.toLowerCase() === normalized)
        );
        // Check if it's already selected
        const alreadySelected = value.includes(normalized);
        return !existsInPredefined && !alreadySelected;
    }, [allowCustom, search, value]);

    const customExtensionValue = useMemo(() => {
        if (!isValidCustomExtension) return "";
        const trimmed = search.trim().toLowerCase();
        return trimmed.startsWith(".") ? trimmed : `.${trimmed}`;
    }, [isValidCustomExtension, search]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "h-auto min-h-9 w-fit min-w-[200px] justify-between hover:bg-transparent font-normal",
                        className
                    )}
                >
                    <div className="flex flex-wrap items-center gap-1 pr-2">
                        {value.length > 0 ? (
                            <>
                                {visibleItems.map((val) => (
                                    <Badge
                                        key={val}
                                        variant="outline"
                                        className="rounded-sm px-1.5 py-0"
                                    >
                                        {getLabel(val)}
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => removeSelection(val, e)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    removeSelection(
                                                        val,
                                                        e as unknown as React.MouseEvent
                                                    );
                                                }
                                            }}
                                            className="ml-1 hover:text-destructive cursor-pointer"
                                        >
                                            <X className="h-3 w-3" />
                                        </span>
                                    </Badge>
                                ))}
                                {(hiddenCount > 0 || expanded) && (
                                    <Badge
                                        variant="outline"
                                        className="rounded-sm px-1.5 py-0 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpanded(!expanded);
                                        }}
                                    >
                                        {expanded ? "Show Less" : `+${hiddenCount} more`}
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="min-w-[--radix-popover-trigger-width] w-auto p-0"
                align="start"
            >
                <Command>
                    <CommandInput
                        placeholder={
                            allowCustom
                                ? "Search or type custom extension..."
                                : "Search file types..."
                        }
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {isValidCustomExtension ? (
                                <button
                                    type="button"
                                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left hover:bg-sidebar-accent rounded-lg transition-colors"
                                    onClick={() => addCustomExtension(customExtensionValue)}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add custom extension</span>
                                    <code className="px-1 text-[10px] font-mono bg-sidebar-foreground/10 rounded text-muted-foreground/80">
                                        {customExtensionValue}
                                    </code>
                                </button>
                            ) : (
                                "No file type found."
                            )}
                        </CommandEmpty>
                        {isValidCustomExtension && (
                            <CommandGroup heading="Custom">
                                <CommandItem
                                    value={`custom ${customExtensionValue}`}
                                    onSelect={() => addCustomExtension(customExtensionValue)}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add custom extension</span>
                                    <code className="ml-1 px-1 text-[10px] font-mono bg-sidebar-foreground/10 rounded text-muted-foreground/80">
                                        {customExtensionValue}
                                    </code>
                                </CommandItem>
                            </CommandGroup>
                        )}
                        {Array.from(groupedOptions).map(([category, options]) => (
                            <CommandGroup key={category} heading={category}>
                                {options.map((opt) => (
                                    <CommandItem
                                        key={opt.value}
                                        value={`${opt.label} ${opt.value}`}
                                        onSelect={() => toggleSelection(opt.value)}
                                    >
                                        <span className="whitespace-nowrap">{opt.label}</span>
                                        <span className="ml-1 flex flex-wrap gap-0.5">
                                            {opt.value.split(",").map((ext) => (
                                                <code
                                                    key={ext}
                                                    className="px-1 text-[10px] font-mono bg-sidebar-foreground/10 rounded text-muted-foreground/80"
                                                >
                                                    {ext}
                                                </code>
                                            ))}
                                        </span>
                                        {value.includes(opt.value) && (
                                            <Check className="ml-auto h-4 w-4" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
