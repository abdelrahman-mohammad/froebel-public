"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { ShowcaseItem } from "../ShowcaseItem";

const tags = Array.from({ length: 50 }).map((_, i, a) => `Tag ${a.length - i}`);

const artworks = [
    { title: "Abstract", artist: "Artist 1" },
    { title: "Landscape", artist: "Artist 2" },
    { title: "Portrait", artist: "Artist 3" },
    { title: "Still Life", artist: "Artist 4" },
    { title: "Modern", artist: "Artist 5" },
    { title: "Classical", artist: "Artist 6" },
    { title: "Digital", artist: "Artist 7" },
    { title: "Photography", artist: "Artist 8" },
];

export function ScrollAreaShowcase() {
    return (
        <ShowcaseItem
            title="Scroll Area"
            description="Custom scrollbar styling for overflow content"
        >
            <div className="space-y-6">
                {/* Vertical Scroll */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Vertical Scroll
                    </h4>
                    <ScrollArea className="h-72 w-48 rounded-md border">
                        <div className="p-4">
                            <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
                            {tags.map((tag) => (
                                <div key={tag}>
                                    <div className="text-sm">{tag}</div>
                                    <Separator className="my-2" />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Horizontal Scroll */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Horizontal Scroll
                    </h4>
                    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
                        <div className="flex w-max space-x-4 p-4">
                            {artworks.map((artwork) => (
                                <figure key={artwork.title} className="shrink-0">
                                    <div className="overflow-hidden rounded-md">
                                        <div className="h-32 w-48 bg-muted flex items-center justify-center">
                                            <span className="text-sm text-muted-foreground">
                                                {artwork.title}
                                            </span>
                                        </div>
                                    </div>
                                    <figcaption className="pt-2 text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground">
                                            {artwork.artist}
                                        </span>
                                        <span> - {artwork.title}</span>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>

                {/* Both Directions */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Both Directions
                    </h4>
                    <ScrollArea className="h-48 w-72 rounded-md border">
                        <div className="p-4 w-[500px]">
                            <h4 className="mb-4 text-sm font-medium leading-none">Code Preview</h4>
                            <pre className="text-xs text-muted-foreground">
                                {`function fibonacci(n: number): number {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 20 fibonacci numbers
const results = [];
for (let i = 0; i < 20; i++) {
    results.push(fibonacci(i));
}

console.log('Fibonacci sequence:', results);
// Output: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34...

function isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;

    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) {
            return false;
        }
    }
    return true;
}

// Find all primes up to 100
const primes = [];
for (let i = 2; i <= 100; i++) {
    if (isPrime(i)) primes.push(i);
}
console.log('Primes:', primes);`}
                            </pre>
                        </div>
                        <ScrollBar orientation="vertical" />
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>

                {/* Card List */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Card List</h4>
                    <ScrollArea className="h-64 w-80 rounded-md border">
                        <div className="p-4 space-y-4">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                                    <h5 className="font-medium text-sm">Card {i + 1}</h5>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This is a sample card content in a scrollable area.
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </ShowcaseItem>
    );
}
