"use client";

import React, { useEffect, useRef, useState } from "react";

import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

export interface TimerProps {
    /** Time remaining in seconds */
    timeRemaining: number;
    /** Whether timer is in warning state (<60s) */
    isWarning: boolean;
    /** Whether the timer is running */
    isRunning?: boolean;
    /** Additional class name */
    className?: string;
}

/**
 * Formats seconds into MM:SS display
 */
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Quiz timer display component
 * Shows remaining time with warning state when low
 */
export function Timer({ timeRemaining, isWarning, isRunning = true, className }: TimerProps) {
    const formattedTime = formatTime(Math.max(0, timeRemaining));
    const isExpired = timeRemaining <= 0;

    // Track last announced time to avoid constant screen reader updates
    const lastAnnouncedRef = useRef<number>(timeRemaining);
    const [announcement, setAnnouncement] = useState<string>("");

    // Only announce on significant changes (every 30s, on warning, on expiry)
    useEffect(() => {
        const lastAnnounced = lastAnnouncedRef.current;
        const timeDiff = lastAnnounced - timeRemaining;

        // Announce when: entering warning state, every 30 seconds, or expired
        const shouldAnnounce =
            (isWarning && lastAnnounced > 60 && timeRemaining <= 60) || // Just entered warning
            timeDiff >= 30 || // Every 30 seconds
            (isExpired && lastAnnounced > 0); // Just expired

        if (shouldAnnounce && isRunning) {
            lastAnnouncedRef.current = timeRemaining;
            if (isExpired) {
                setAnnouncement("Time is up!");
            } else if (isWarning) {
                setAnnouncement(`Warning: ${timeRemaining} seconds remaining`);
            } else {
                const mins = Math.floor(timeRemaining / 60);
                setAnnouncement(`${mins} minute${mins !== 1 ? "s" : ""} remaining`);
            }
        }
    }, [timeRemaining, isWarning, isExpired, isRunning]);

    return (
        <div
            className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-mono text-lg font-semibold",
                isWarning && "text-warning bg-warning/20 animate-pulse",
                isExpired && "text-destructive bg-destructive/20",
                !isRunning && "opacity-60",
                className
            )}
            role="timer"
            aria-label={`Time remaining: ${formattedTime}`}
        >
            <Clock className={cn("w-5 h-5", isWarning ? "text-warning" : "text-muted-foreground")} aria-hidden="true" />
            <span>{formattedTime}</span>
            {/* Visually hidden live region for screen reader announcements */}
            <span className="sr-only" aria-live="polite" aria-atomic="true">
                {announcement}
            </span>
        </div>
    );
}

export default Timer;
