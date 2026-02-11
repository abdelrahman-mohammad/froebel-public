"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTimerOptions {
    /** Total time in seconds */
    duration: number;
    /** Whether the timer is enabled */
    enabled: boolean;
    /** Callback when timer expires */
    onExpire?: () => void;
    /** Whether to auto-start the timer */
    autoStart?: boolean;
}

export interface UseTimerReturn {
    /** Time remaining in seconds */
    timeRemaining: number;
    /** Whether time is < 60 seconds (warning state) */
    isWarning: boolean;
    /** Formatted time string "MM:SS" */
    formattedTime: string;
    /** Whether the timer is currently running */
    isRunning: boolean;
    /** Start the timer */
    start: () => void;
    /** Stop the timer and reset to initial duration */
    stop: () => void;
    /** Pause the timer (can be resumed with start) */
    pause: () => void;
    /** Reset the timer to initial duration without starting */
    reset: () => void;
}

/**
 * Custom hook for countdown timer functionality
 * Migrated from quiz-player.js: startTimer, updateTimerDisplay, onTimerExpired
 */
export function useTimer({
    duration,
    enabled,
    onExpire,
    autoStart = false,
}: UseTimerOptions): UseTimerReturn {
    const [timeRemaining, setTimeRemaining] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const onExpireRef = useRef(onExpire);

    // Keep onExpire ref updated
    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    // Reset when duration changes
    useEffect(() => {
        setTimeRemaining(duration);
    }, [duration]);

    // Auto-start if enabled
    useEffect(() => {
        if (enabled && autoStart && duration > 0) {
            setIsRunning(true);
        }
    }, [enabled, autoStart, duration]);

    // Timer tick logic
    useEffect(() => {
        if (!enabled || !isRunning || timeRemaining <= 0) {
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                const newTime = prev - 1;
                if (newTime <= 0) {
                    setIsRunning(false);
                    onExpireRef.current?.();
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [enabled, isRunning, timeRemaining]);

    const start = useCallback(() => {
        if (enabled && timeRemaining > 0) {
            setIsRunning(true);
        }
    }, [enabled, timeRemaining]);

    const pause = useCallback(() => {
        setIsRunning(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const stop = useCallback(() => {
        pause();
        setTimeRemaining(duration);
    }, [pause, duration]);

    const reset = useCallback(() => {
        setTimeRemaining(duration);
    }, [duration]);

    // Format time as MM:SS
    const formattedTime = formatTime(timeRemaining);

    // Warning state when < 60 seconds
    const isWarning = timeRemaining > 0 && timeRemaining <= 60;

    return {
        timeRemaining,
        isWarning,
        formattedTime,
        isRunning,
        start,
        stop,
        pause,
        reset,
    };
}

/**
 * Format seconds to MM:SS display
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
