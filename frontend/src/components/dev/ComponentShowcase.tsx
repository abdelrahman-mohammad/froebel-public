"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// Dev-only component using mounted state pattern for SSR hydration
import { useEffect, useState } from "react";

import { useTheme } from "next-themes";

import { Monitor, Moon, Sun } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { ShowcaseSection } from "./ShowcaseSection";
import { AlertDialogShowcase } from "./showcases/AlertDialogShowcase";
// New showcases
import { AvatarShowcase } from "./showcases/AvatarShowcase";
import { BadgeShowcase } from "./showcases/BadgeShowcase";
// Showcase imports
import { ButtonShowcase } from "./showcases/ButtonShowcase";
import { CalendarShowcase } from "./showcases/CalendarShowcase";
import { CardShowcase } from "./showcases/CardShowcase";
import { CheckboxShowcase } from "./showcases/CheckboxShowcase";
import { CircularProgressShowcase } from "./showcases/CircularProgressShowcase";
import { CollapsibleShowcase } from "./showcases/CollapsibleShowcase";
import { CommandShowcase } from "./showcases/CommandShowcase";
import { CursorShowcase } from "./showcases/CursorShowcase";
import { DialogShowcase } from "./showcases/DialogShowcase";
import { DropdownMenuShowcase } from "./showcases/DropdownMenuShowcase";
import { EditorShowcase } from "./showcases/EditorShowcase";
import { FileTypeComboboxShowcase } from "./showcases/FileTypeComboboxShowcase";
import { FormGroupShowcase } from "./showcases/FormGroupShowcase";
import { ImageInputShowcase } from "./showcases/ImageInputShowcase";
import { InputShowcase } from "./showcases/InputShowcase";
import { KbdShowcase } from "./showcases/KbdShowcase";
import { NumberInputShowcase } from "./showcases/NumberInputShowcase";
import { PopoverShowcase } from "./showcases/PopoverShowcase";
import { ProgressShowcase } from "./showcases/ProgressShowcase";
import { RadioGroupShowcase } from "./showcases/RadioGroupShowcase";
import { ScrollAreaShowcase } from "./showcases/ScrollAreaShowcase";
import { SelectShowcase } from "./showcases/SelectShowcase";
import { SeparatorShowcase } from "./showcases/SeparatorShowcase";
import { SheetShowcase } from "./showcases/SheetShowcase";
import { SkeletonShowcase } from "./showcases/SkeletonShowcase";
import { SonnerShowcase } from "./showcases/SonnerShowcase";
import { SwitchShowcase } from "./showcases/SwitchShowcase";
import { TabsShowcase } from "./showcases/TabsShowcase";
import { TagsInputShowcase } from "./showcases/TagsInputShowcase";
import { TextareaShowcase } from "./showcases/TextareaShowcase";
import { ToggleGroupShowcase } from "./showcases/ToggleGroupShowcase";
import { ToggleShowcase } from "./showcases/ToggleShowcase";
import { TooltipShowcase } from "./showcases/TooltipShowcase";

const SECTIONS = [
    {
        id: "actions",
        title: "Actions",
        items: ["Button", "Badge", "Kbd", "Toggle", "Toggle Group"],
    },
    {
        id: "forms",
        title: "Forms",
        items: [
            "Input",
            "Textarea",
            "Select",
            "Checkbox",
            "Radio Group",
            "Switch",
            "Form Group",
            "Number Input",
            "Tags Input",
            "Image Input",
            "File Type Combobox",
            "Calendar",
        ],
    },
    {
        id: "content",
        title: "Content",
        items: ["Editor"],
    },
    {
        id: "feedback",
        title: "Feedback",
        items: [
            "Progress",
            "Circular Progress",
            "Dialog",
            "Alert Dialog",
            "Tooltip",
            "Popover",
            "Sheet",
            "Skeleton",
            "Toast",
        ],
    },
    {
        id: "navigation",
        title: "Navigation",
        items: ["Tabs", "Dropdown Menu", "Command"],
    },
    {
        id: "layout",
        title: "Layout",
        items: ["Card", "Avatar", "Separator", "Scroll Area", "Collapsible"],
    },
    {
        id: "cursors",
        title: "Cursors",
        items: ["Cursor"],
    },
];

export function ComponentShowcase() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <h1 className="text-2xl font-bold text-foreground">Component Library</h1>
                    <p className="text-sm text-muted-foreground">Dev-only showcase</p>
                </div>
            </header>

            {/* Main Layout with Sidebar */}
            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
                {/* Main Content */}
                <main className="flex-1 min-w-0 space-y-16">
                    {/* Actions Section */}
                    <ShowcaseSection id="actions" title="Actions">
                        <ButtonShowcase />
                        <BadgeShowcase />
                        <KbdShowcase />
                        <ToggleShowcase />
                        <ToggleGroupShowcase />
                    </ShowcaseSection>

                    {/* Forms Section */}
                    <ShowcaseSection id="forms" title="Forms">
                        <InputShowcase />
                        <TextareaShowcase />
                        <SelectShowcase />
                        <CheckboxShowcase />
                        <RadioGroupShowcase />
                        <SwitchShowcase />
                        <FormGroupShowcase />
                        <NumberInputShowcase />
                        <TagsInputShowcase />
                        <ImageInputShowcase />
                        <FileTypeComboboxShowcase />
                        <CalendarShowcase />
                    </ShowcaseSection>

                    {/* Content Section */}
                    <ShowcaseSection id="content" title="Content">
                        <EditorShowcase />
                    </ShowcaseSection>

                    {/* Feedback Section */}
                    <ShowcaseSection id="feedback" title="Feedback">
                        <ProgressShowcase />
                        <CircularProgressShowcase />
                        <DialogShowcase />
                        <AlertDialogShowcase />
                        <TooltipShowcase />
                        <PopoverShowcase />
                        <SheetShowcase />
                        <SkeletonShowcase />
                        <SonnerShowcase />
                    </ShowcaseSection>

                    {/* Navigation Section */}
                    <ShowcaseSection id="navigation" title="Navigation">
                        <TabsShowcase />
                        <DropdownMenuShowcase />
                        <CommandShowcase />
                    </ShowcaseSection>

                    {/* Layout Section */}
                    <ShowcaseSection id="layout" title="Layout">
                        <CardShowcase />
                        <AvatarShowcase />
                        <SeparatorShowcase />
                        <ScrollAreaShowcase />
                        <CollapsibleShowcase />
                    </ShowcaseSection>

                    {/* Cursors Section */}
                    <ShowcaseSection id="cursors" title="Cursors">
                        <CursorShowcase />
                    </ShowcaseSection>

                    {/* Footer */}
                    <footer className="border-t border-border py-6 mt-16">
                        <p className="text-sm text-muted-foreground text-center">
                            This page is only visible in development mode.
                        </p>
                    </footer>
                </main>

                {/* Right Sidebar Navigation */}
                <aside className="hidden lg:block w-52 shrink-0">
                    <div className="sticky top-8">
                        {/* Theme Toggle */}
                        <ToggleGroup
                            type="single"
                            value={theme}
                            onValueChange={(value) => value && setTheme(value)}
                            className="mb-6"
                        >
                            <ToggleGroupItem value="light" aria-label="Light mode">
                                <Sun className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="dark" aria-label="Dark mode">
                                <Moon className="h-4 w-4" />
                            </ToggleGroupItem>
                            <ToggleGroupItem value="system" aria-label="System theme">
                                <Monitor className="h-4 w-4" />
                            </ToggleGroupItem>
                        </ToggleGroup>

                        {/* Navigation */}
                        <nav className="max-h-[calc(100vh-10rem)] overflow-y-auto">
                            <h3 className="text-sm font-semibold text-foreground mb-3">
                                On this page
                            </h3>
                            <ul className="space-y-3 border-l border-border">
                                {SECTIONS.map((section) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className="block pl-4 py-0.5 text-xs font-semibold text-foreground hover:text-primary border-l-2 border-transparent hover:border-primary -ml-px transition-colors"
                                        >
                                            {section.title}
                                        </a>
                                        <ul className="mt-1 space-y-0.5">
                                            {section.items.map((item) => (
                                                <li key={item}>
                                                    <a
                                                        href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                                        className="block pl-4 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {item}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </aside>
            </div>
        </div>
    );
}
