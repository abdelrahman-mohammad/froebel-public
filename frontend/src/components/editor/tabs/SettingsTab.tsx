"use client";

import { useState } from "react";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Eye, Globe, Link2, RefreshCw, Settings, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useEditor } from "@/contexts/EditorContext";

import { cn } from "@/lib/utils";

import type { QuizSettings } from "@/types/quiz";

// Helper function to generate random access code
function generateAccessCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
}

type SettingsSection = "options" | "access" | "availability";

interface NavItem {
    id: SettingsSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { id: "options", label: "Options", icon: Settings },
    { id: "access", label: "Access", icon: Eye },
    { id: "availability", label: "Availability", icon: CalendarIcon },
];

export function SettingsTab() {
    const { state, updateTimeLimit, updateSettings } = useEditor();
    const { quiz } = state;
    const settings = quiz.settings || {};

    const [activeSection, setActiveSection] = useState<SettingsSection>("options");

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-44 shrink-0">
                    <nav className="flex md:flex-col gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={cn(
                                        "flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors text-left text-sm",
                                        "hover:bg-muted",
                                        isActive
                                            ? "bg-muted text-foreground font-medium"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 min-w-0">
                    {activeSection === "options" && (
                        <OptionsSection
                            settings={settings}
                            timeLimit={quiz.timeLimit}
                            updateSettings={updateSettings}
                            updateTimeLimit={updateTimeLimit}
                        />
                    )}
                    {activeSection === "access" && (
                        <AccessSection settings={settings} updateSettings={updateSettings} />
                    )}
                    {activeSection === "availability" && (
                        <AvailabilitySection settings={settings} updateSettings={updateSettings} />
                    )}
                </main>
            </div>
        </div>
    );
}

// Options Section
interface OptionsSectionProps {
    settings: QuizSettings;
    timeLimit: number | null | undefined;
    updateSettings: (settings: Partial<QuizSettings>) => void;
    updateTimeLimit: (limit: number) => void;
}

function OptionsSection({
    settings,
    timeLimit,
    updateSettings,
    updateTimeLimit,
}: OptionsSectionProps) {
    return (
        <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Quiz Options
            </h3>
            <div className="border-b border-border/50 -mt-2 mb-6" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Shuffle Questions</Label>
                        <p className="text-xs text-muted-foreground">
                            Randomize the order of questions for each taker
                        </p>
                    </div>
                    <Switch
                        checked={settings.shuffleQuestions || false}
                        onCheckedChange={(checked) => updateSettings({ shuffleQuestions: checked })}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label>Shuffle Answers</Label>
                        <p className="text-xs text-muted-foreground">
                            Randomize the order of answer choices
                        </p>
                    </div>
                    <Switch
                        checked={settings.shuffleChoices || false}
                        onCheckedChange={(checked) => updateSettings({ shuffleChoices: checked })}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label>Show Correct Answers</Label>
                        <p className="text-xs text-muted-foreground">
                            Let takers see correct answers after submission
                        </p>
                    </div>
                    <Switch
                        checked={settings.showCorrectAnswers !== false}
                        onCheckedChange={(checked) =>
                            updateSettings({ showCorrectAnswers: checked })
                        }
                    />
                </div>

                {/* Time Limit, Passing Score, Max Attempts - inline */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Time Limit</Label>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <NumberInput
                                    value={timeLimit || ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        updateTimeLimit(value ? Math.max(1, parseInt(value)) : 0);
                                    }}
                                    min={1}
                                    max={480}
                                    step={5}
                                    placeholder="No limit"
                                    className={timeLimit ? "w-24 pr-12" : "w-24"}
                                />
                                {timeLimit ? (
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                                        min
                                    </span>
                                ) : null}
                            </div>
                            {timeLimit ? (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => updateTimeLimit(0)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Passing Score</Label>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <NumberInput
                                    value={settings.passingScore ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        updateSettings({
                                            passingScore: value
                                                ? Math.min(100, Math.max(1, parseInt(value) || 0))
                                                : null,
                                        });
                                    }}
                                    min={1}
                                    max={100}
                                    step={5}
                                    placeholder="Any score"
                                    className={settings.passingScore ? "w-24 pr-10" : "w-24"}
                                />
                                {settings.passingScore ? (
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                                        %
                                    </span>
                                ) : null}
                            </div>
                            {settings.passingScore ? (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => updateSettings({ passingScore: null })}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Max Attempts</Label>
                        <div className="flex items-center gap-2">
                            <NumberInput
                                value={settings.maxAttempts ?? ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    updateSettings({
                                        maxAttempts: value ? Math.max(1, parseInt(value)) : null,
                                    });
                                }}
                                min={1}
                                placeholder="Unlimited"
                                className="w-24"
                            />
                            {settings.maxAttempts && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => updateSettings({ maxAttempts: null })}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// IP Address validation helpers
function isValidIPv4(ip: string): boolean {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every((part) => {
        const num = parseInt(part, 10);
        return !isNaN(num) && num >= 0 && num <= 255 && part === String(num);
    });
}

function isValidIPv6(ip: string): boolean {
    // Simplified IPv6 validation - accepts standard and compressed formats
    const ipv6Regex = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|::)$/;
    return ipv6Regex.test(ip);
}

function isValidCIDR(cidr: string): boolean {
    const parts = cidr.split("/");
    if (parts.length !== 2) return false;
    const [ip, prefix] = parts;
    const prefixNum = parseInt(prefix, 10);

    if (isValidIPv4(ip)) {
        return !isNaN(prefixNum) && prefixNum >= 0 && prefixNum <= 32;
    }
    if (isValidIPv6(ip)) {
        return !isNaN(prefixNum) && prefixNum >= 0 && prefixNum <= 128;
    }
    return false;
}

function validateIPEntry(entry: string): { valid: boolean; error?: string } {
    const trimmed = entry.trim();
    if (!trimmed) return { valid: true }; // Empty lines are OK

    if (trimmed.includes("/")) {
        if (isValidCIDR(trimmed)) return { valid: true };
        return { valid: false, error: `Invalid CIDR notation: ${trimmed}` };
    }

    if (isValidIPv4(trimmed) || isValidIPv6(trimmed)) return { valid: true };
    return { valid: false, error: `Invalid IP address: ${trimmed}` };
}

function validateIPAddresses(value: string): string[] {
    const lines = value.split("\n");
    const errors: string[] = [];
    lines.forEach((line, index) => {
        const result = validateIPEntry(line);
        if (!result.valid && result.error) {
            errors.push(`Line ${index + 1}: ${result.error}`);
        }
    });
    return errors;
}

// Access Section
interface AccessSectionProps {
    settings: QuizSettings;
    updateSettings: (settings: Partial<QuizSettings>) => void;
}

function AccessSection({ settings, updateSettings }: AccessSectionProps) {
    const [ipErrors, setIpErrors] = useState<string[]>([]);

    const handleIPAddressChange = (value: string) => {
        updateSettings({ allowedIpAddresses: value });
        // Validate on change
        const errors = validateIPAddresses(value);
        setIpErrors(errors);
    };

    return (
        <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Access & Visibility
            </h3>
            <div className="border-b border-border/50 -mt-2 mb-6" />

            <div className="space-y-6">
                {/* Discoverability */}
                <div className="space-y-3">
                    <div>
                        <Label>Discoverability</Label>
                        <p className="text-xs text-muted-foreground">
                            Control how others can find your published quiz
                        </p>
                    </div>
                    <RadioGroup
                        value={settings.isPublic === false ? "unlisted" : "listed"}
                        onValueChange={(value) => updateSettings({ isPublic: value === "listed" })}
                        className="flex gap-3"
                    >
                        <label
                            htmlFor="listed"
                            className="flex flex-1 items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                        >
                            <RadioGroupItem value="listed" id="listed" className="mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Listed</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Anyone can find this quiz in Explore
                                </p>
                            </div>
                        </label>
                        <label
                            htmlFor="unlisted"
                            className="flex flex-1 items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                        >
                            <RadioGroupItem value="unlisted" id="unlisted" className="mt-0.5" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Link2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">Unlisted</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Only people with the direct link can access
                                </p>
                            </div>
                        </label>
                    </RadioGroup>
                </div>

                {/* Allow Anonymous */}
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Allow Anonymous Access</Label>
                        <p className="text-xs text-muted-foreground">
                            Allow non-logged in users to take this quiz
                        </p>
                    </div>
                    <Switch
                        checked={settings.allowAnonymous || false}
                        onCheckedChange={(checked) => updateSettings({ allowAnonymous: checked })}
                    />
                </div>

                {/* Access Code */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Require Access Code</Label>
                            <p className="text-xs text-muted-foreground">
                                Takers must enter a code to access the quiz
                            </p>
                        </div>
                        <Switch
                            checked={settings.requireAccessCode || false}
                            onCheckedChange={(checked) =>
                                updateSettings({ requireAccessCode: checked })
                            }
                        />
                    </div>

                    {settings.requireAccessCode && (
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                            <Label>Access Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={settings.accessCode || ""}
                                    onChange={(e) =>
                                        updateSettings({
                                            accessCode: e.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder="e.g., ABC123"
                                    className="w-32 uppercase font-mono"
                                    maxLength={6}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        updateSettings({
                                            accessCode: generateAccessCode(),
                                        })
                                    }
                                    className="gap-1"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Generate
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* IP Filtering */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Filter IP Addresses</Label>
                            <p className="text-xs text-muted-foreground">
                                Only allow access from specific IP addresses
                            </p>
                        </div>
                        <Switch
                            checked={settings.filterIpAddresses || false}
                            onCheckedChange={(checked) =>
                                updateSettings({ filterIpAddresses: checked })
                            }
                        />
                    </div>

                    {settings.filterIpAddresses && (
                        <div className="space-y-2 pl-4 border-l-2 border-muted">
                            <Label>Allowed IP Addresses</Label>
                            <Textarea
                                value={settings.allowedIpAddresses || ""}
                                onChange={(e) => handleIPAddressChange(e.target.value)}
                                placeholder="192.168.1.1&#10;10.0.0.0/24&#10;..."
                                className={cn(
                                    "font-mono text-sm",
                                    ipErrors.length > 0 && "border-destructive focus-visible:ring-destructive"
                                )}
                                rows={4}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter one IP address or CIDR range per line
                            </p>
                            {ipErrors.length > 0 && (
                                <div className="text-xs text-destructive space-y-1">
                                    {ipErrors.slice(0, 3).map((error, i) => (
                                        <p key={i}>{error}</p>
                                    ))}
                                    {ipErrors.length > 3 && (
                                        <p>...and {ipErrors.length - 3} more error(s)</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

// Availability Section
interface AvailabilitySectionProps {
    settings: QuizSettings;
    updateSettings: (settings: Partial<QuizSettings>) => void;
}

// Helper to parse ISO string to Date
function parseISOString(isoString: string | undefined): Date | undefined {
    if (!isoString) return undefined;
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? undefined : date;
}

// Helper to get time string (HH:MM) from Date
function getTimeString(date: Date | undefined): string {
    if (!date) return "";
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

// Helper to combine date and time into ISO string
function combineDateTime(date: Date | undefined, timeString: string): string | undefined {
    if (!date) return undefined;
    const newDate = new Date(date);
    if (timeString) {
        const [hours, minutes] = timeString.split(":").map(Number);
        newDate.setHours(hours || 0, minutes || 0, 0, 0);
    }
    return newDate.toISOString();
}

function AvailabilitySection({ settings, updateSettings }: AvailabilitySectionProps) {
    const [openFrom, setOpenFrom] = useState(false);
    const [openTo, setOpenTo] = useState(false);
    const [openResults, setOpenResults] = useState(false);

    const dateFrom = parseISOString(settings.availableFrom);
    const dateTo = parseISOString(settings.availableTo);
    const dateResults = parseISOString(settings.resultsVisibleFrom);

    // Validate date ranges
    const hasInvalidDateRange = dateFrom && dateTo && dateTo < dateFrom;

    const handleDateChange = (
        field: "availableFrom" | "availableTo" | "resultsVisibleFrom",
        date: Date | undefined,
        currentTimeString: string
    ) => {
        if (!date) {
            updateSettings({ [field]: undefined });
            return;
        }
        updateSettings({
            [field]: combineDateTime(date, currentTimeString || "00:00"),
        });
    };

    const handleTimeChange = (
        field: "availableFrom" | "availableTo" | "resultsVisibleFrom",
        currentDate: Date | undefined,
        timeString: string
    ) => {
        if (!currentDate) {
            // If no date is set, use today
            const today = new Date();
            updateSettings({ [field]: combineDateTime(today, timeString) });
            return;
        }
        updateSettings({ [field]: combineDateTime(currentDate, timeString) });
    };

    return (
        <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Availability Schedule
            </h3>
            <div className="border-b border-border/50 -mt-2 mb-6" />

            <div className="space-y-6">
                {/* Available From & Until - inline */}
                <div className="grid grid-cols-2 gap-6">
                    {/* Available From */}
                    <div className="space-y-2">
                        <Label>Available From</Label>
                        <div className="flex flex-wrap items-center gap-2">
                            <Popover open={openFrom} onOpenChange={setOpenFrom}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        data-empty={!dateFrom}
                                        className="w-36 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        {dateFrom ? format(dateFrom, "PP") : <span>Pick date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateFrom}
                                        onSelect={(date) => {
                                            handleDateChange(
                                                "availableFrom",
                                                date,
                                                getTimeString(dateFrom)
                                            );
                                            setOpenFrom(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={getTimeString(dateFrom)}
                                onChange={(e) =>
                                    handleTimeChange("availableFrom", dateFrom, e.target.value)
                                }
                                className="w-24 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                            {settings.availableFrom && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => updateSettings({ availableFrom: undefined })}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Quiz becomes available</p>
                    </div>

                    {/* Available Until */}
                    <div className="space-y-2">
                        <Label>Available Until</Label>
                        <div className="flex flex-wrap items-center gap-2">
                            <Popover open={openTo} onOpenChange={setOpenTo}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        data-empty={!dateTo}
                                        className="w-36 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        {dateTo ? format(dateTo, "PP") : <span>Pick date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dateTo}
                                        onSelect={(date) => {
                                            handleDateChange(
                                                "availableTo",
                                                date,
                                                getTimeString(dateTo)
                                            );
                                            setOpenTo(false);
                                        }}
                                        disabled={dateFrom ? { before: dateFrom } : undefined}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Input
                                type="time"
                                value={getTimeString(dateTo)}
                                onChange={(e) =>
                                    handleTimeChange("availableTo", dateTo, e.target.value)
                                }
                                className="w-24 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                            {settings.availableTo && (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => updateSettings({ availableTo: undefined })}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Quiz closes</p>
                        {hasInvalidDateRange && (
                            <p className="text-xs text-destructive">
                                End date must be after start date
                            </p>
                        )}
                    </div>
                </div>

                {/* Results Visible From */}
                <div className="space-y-2">
                    <Label>Results Visible From</Label>
                    <div className="flex items-center gap-2">
                        <Popover open={openResults} onOpenChange={setOpenResults}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    data-empty={!dateResults}
                                    className="w-44 justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
                                >
                                    <CalendarIcon className="h-4 w-4" />
                                    {dateResults ? (
                                        format(dateResults, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dateResults}
                                    onSelect={(date) => {
                                        handleDateChange(
                                            "resultsVisibleFrom",
                                            date,
                                            getTimeString(dateResults)
                                        );
                                        setOpenResults(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            type="time"
                            value={getTimeString(dateResults)}
                            onChange={(e) =>
                                handleTimeChange("resultsVisibleFrom", dateResults, e.target.value)
                            }
                            className="w-24 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        {settings.resultsVisibleFrom && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() =>
                                    updateSettings({
                                        resultsVisibleFrom: undefined,
                                    })
                                }
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Results are hidden until this date and time (leave empty for immediate)
                    </p>
                </div>
            </div>
        </section>
    );
}
