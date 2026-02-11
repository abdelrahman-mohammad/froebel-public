/**
 * useSearch Hook
 * Manages global search with debouncing for the header search bar
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getSearchErrorMessage, quickSearch } from "@/lib/search/api";
import type { SearchResultDTO } from "@/lib/search/types";

export interface UseSearchReturn {
    query: string;
    setQuery: (query: string) => void;
    results: SearchResultDTO | null;
    isLoading: boolean;
    error: string | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    clearSearch: () => void;
}

export function useSearch(debounceMs = 300): UseSearchReturn {
    const [query, setQueryState] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<SearchResultDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounce the query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [query, debounceMs]);

    // Fetch results when debounced query changes
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults(null);
            return;
        }

        const fetchResults = async () => {
            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setIsLoading(true);
            setError(null);

            try {
                const data = await quickSearch(debouncedQuery, 5);
                setResults(data);
                setIsOpen(true);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;
                setError(getSearchErrorMessage(err));
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const setQuery = useCallback((q: string) => {
        setQueryState(q);
        if (!q.trim()) {
            setResults(null);
            setIsOpen(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setQueryState("");
        setDebouncedQuery("");
        setResults(null);
        setIsOpen(false);
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        isOpen,
        setIsOpen,
        clearSearch,
    };
}

export default useSearch;
