"use client";

import { useState } from "react";

import {
    Calculator,
    Calendar,
    CreditCard,
    FileText,
    Mail,
    MessageSquare,
    Search,
    Settings,
    Smile,
    User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

import { ShowcaseItem } from "../ShowcaseItem";

export function CommandShowcase() {
    const [open, setOpen] = useState(false);

    return (
        <ShowcaseItem
            title="Command"
            description="Command palette with search and keyboard navigation"
        >
            <div className="space-y-6">
                {/* Inline Command */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Inline</h4>
                    <Command className="rounded-lg border shadow-md w-[400px]">
                        <CommandInput placeholder="Type a command or search..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                <CommandItem>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Calendar</span>
                                </CommandItem>
                                <CommandItem>
                                    <Smile className="mr-2 h-4 w-4" />
                                    <span>Search Emoji</span>
                                </CommandItem>
                                <CommandItem>
                                    <Calculator className="mr-2 h-4 w-4" />
                                    <span>Calculator</span>
                                </CommandItem>
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup heading="Settings">
                                <CommandItem>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                    <CommandShortcut>⌘P</CommandShortcut>
                                </CommandItem>
                                <CommandItem>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    <span>Billing</span>
                                    <CommandShortcut>⌘B</CommandShortcut>
                                </CommandItem>
                                <CommandItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                    <CommandShortcut>⌘S</CommandShortcut>
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>

                {/* Dialog Command */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Dialog (⌘K Style)
                    </h4>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => setOpen(true)}>
                            <Search className="mr-2 h-4 w-4" />
                            Open Command Palette
                        </Button>
                        <span className="text-sm text-muted-foreground">or press ⌘K</span>
                    </div>
                    <CommandDialog open={open} onOpenChange={setOpen}>
                        <CommandInput placeholder="Type a command or search..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Actions">
                                <CommandItem onSelect={() => setOpen(false)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>New Quiz</span>
                                    <CommandShortcut>⌘N</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => setOpen(false)}>
                                    <Search className="mr-2 h-4 w-4" />
                                    <span>Search Quizzes</span>
                                    <CommandShortcut>⌘F</CommandShortcut>
                                </CommandItem>
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup heading="Navigation">
                                <CommandItem onSelect={() => setOpen(false)}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Go to Profile</span>
                                </CommandItem>
                                <CommandItem onSelect={() => setOpen(false)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Go to Settings</span>
                                </CommandItem>
                            </CommandGroup>
                            <CommandSeparator />
                            <CommandGroup heading="Help">
                                <CommandItem onSelect={() => setOpen(false)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    <span>Contact Support</span>
                                </CommandItem>
                                <CommandItem onSelect={() => setOpen(false)}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    <span>Feedback</span>
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </CommandDialog>
                </div>

                {/* Simple Search */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Simple Search List
                    </h4>
                    <Command className="rounded-lg border w-[300px]">
                        <CommandInput placeholder="Search quizzes..." />
                        <CommandList>
                            <CommandEmpty>No quizzes found.</CommandEmpty>
                            <CommandGroup>
                                <CommandItem>Math Fundamentals</CommandItem>
                                <CommandItem>Science Quiz</CommandItem>
                                <CommandItem>History Test</CommandItem>
                                <CommandItem>Geography Challenge</CommandItem>
                                <CommandItem>Literature Review</CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </div>

                {/* Usage Info */}
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-2">Features:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Keyboard navigation with arrow keys</li>
                        <li>Built-in fuzzy search</li>
                        <li>Group items with headings</li>
                        <li>Show keyboard shortcuts</li>
                        <li>Dialog mode for ⌘K style command palette</li>
                    </ul>
                </div>
            </div>
        </ShowcaseItem>
    );
}
