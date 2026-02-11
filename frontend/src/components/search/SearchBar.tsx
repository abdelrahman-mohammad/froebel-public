"use client";

import { useEffect, useRef } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowRight, FileText, GraduationCap, Loader2, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useSearch } from "@/hooks/useSearch";

import { cn } from "@/lib/utils";

export function SearchBar() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { query, setQuery, results, isLoading, error, isOpen, setIsOpen, clearSearch } =
        useSearch(300);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsOpen]);

    // Handle search navigation
    const handleSearch = () => {
        if (query.trim()) {
            setIsOpen(false);
            router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false);
            inputRef.current?.blur();
        } else if (e.key === "Enter") {
            handleSearch();
        }
    };

    const hasResults = results && (results.quizzes.length > 0 || results.courses.length > 0);
    const showDropdown = isOpen && query.trim() && (hasResults || isLoading || error);

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            <div className="flex items-center gap-2">
                {/* Input container */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Search quizzes and courses..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim() && results && setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        className="pl-10 pr-10"
                        size="sm"
                    />
                    {query && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={clearSearch}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Animated search button */}
                <div
                    className={cn(
                        "transition-all duration-200 overflow-hidden",
                        query.trim() ? "w-auto opacity-100 scale-100" : "w-0 opacity-0 scale-95"
                    )}
                >
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="sm" onClick={handleSearch} className="shrink-0">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span className="flex items-center gap-1.5">
                                    Search
                                    <Kbd>Enter</Kbd>
                                </span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-[400px] overflow-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {error && <div className="p-4 text-sm text-destructive">{error}</div>}

                    {!isLoading && !error && hasResults && (
                        <>
                            {/* Quizzes Section */}
                            {results.quizzes.length > 0 && (
                                <div>
                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b">
                                        Quizzes
                                    </div>
                                    {results.quizzes.map((quiz) => (
                                        <Link
                                            key={quiz.id}
                                            href={`/quiz/${quiz.shareableId}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-start gap-3 px-3 py-2 hover:bg-muted transition-colors"
                                        >
                                            <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {quiz.title}
                                                </div>
                                                {quiz.description && (
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {quiz.description}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Courses Section */}
                            {results.courses.length > 0 && (
                                <div>
                                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-b border-t">
                                        Courses
                                    </div>
                                    {results.courses.map((course) => (
                                        <Link
                                            key={course.id}
                                            href={`/course/${course.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-start gap-3 px-3 py-2 hover:bg-muted transition-colors"
                                        >
                                            <GraduationCap className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {course.title}
                                                </div>
                                                {course.description && (
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        {course.description}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* See all link */}
                            <Link
                                href={`/explore?q=${encodeURIComponent(query)}`}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 text-sm text-primary font-medium border-t hover:bg-muted transition-colors text-center"
                            >
                                See all results ({results.totalQuizzes + results.totalCourses})
                            </Link>
                        </>
                    )}

                    {!isLoading && !error && !hasResults && query.trim() && (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            No results found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
