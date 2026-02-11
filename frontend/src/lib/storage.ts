/**
 * localStorage utilities for user preferences
 */

// Storage keys
const STORAGE_KEYS = {
    RANDOMIZATION_PREFS: "quiz_randomization_prefs",
    TIMER_PREFS: "quiz_timer_prefs",
    CHECK_ANSWER_PREF: "quiz_check_answer_pref",
    THEME: "quiz_theme_preference",
} as const;

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
    return typeof window !== "undefined";
}

/**
 * Safely get an item from localStorage
 */
function getItem(key: string): string | null {
    if (!isBrowser()) return null;
    try {
        return localStorage.getItem(key);
    } catch {
        console.error(`Failed to read from localStorage: ${key}`);
        return null;
    }
}

/**
 * Safely set an item in localStorage
 */
function setItem(key: string, value: string): boolean {
    if (!isBrowser()) return false;
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error(`Failed to write to localStorage: ${key}`, error);
        return false;
    }
}

// Preferences Storage

export interface RandomizationPrefs {
    shuffleQuestions: boolean;
    shuffleChoices: boolean;
}

/**
 * Get randomization preferences
 */
export function getRandomizationPrefs(): RandomizationPrefs {
    const data = getItem(STORAGE_KEYS.RANDOMIZATION_PREFS);
    if (!data) {
        return { shuffleQuestions: false, shuffleChoices: false };
    }
    try {
        return JSON.parse(data) as RandomizationPrefs;
    } catch {
        return { shuffleQuestions: false, shuffleChoices: false };
    }
}

/**
 * Save randomization preferences
 */
export function saveRandomizationPrefs(prefs: RandomizationPrefs): void {
    setItem(STORAGE_KEYS.RANDOMIZATION_PREFS, JSON.stringify(prefs));
}

export interface TimerPrefs {
    enabled: boolean;
    customMinutes?: number;
}

/**
 * Get timer preferences
 */
export function getTimerPrefs(): TimerPrefs {
    const data = getItem(STORAGE_KEYS.TIMER_PREFS);
    if (!data) {
        return { enabled: true };
    }
    try {
        return JSON.parse(data) as TimerPrefs;
    } catch {
        return { enabled: true };
    }
}

/**
 * Save timer preferences
 */
export function saveTimerPrefs(prefs: TimerPrefs): void {
    setItem(STORAGE_KEYS.TIMER_PREFS, JSON.stringify(prefs));
}

/**
 * Get check answer preference
 */
export function getCheckAnswerPref(): boolean {
    const data = getItem(STORAGE_KEYS.CHECK_ANSWER_PREF);
    return data === "true";
}

/**
 * Save check answer preference
 */
export function saveCheckAnswerPref(enabled: boolean): void {
    setItem(STORAGE_KEYS.CHECK_ANSWER_PREF, String(enabled));
}

// Theme Storage

export type Theme = "light" | "dark" | "system";

/**
 * Get theme preference
 */
export function getThemePref(): Theme {
    const data = getItem(STORAGE_KEYS.THEME);
    if (data === "light" || data === "dark" || data === "system") {
        return data;
    }
    return "system";
}

/**
 * Save theme preference
 */
export function saveThemePref(theme: Theme): void {
    setItem(STORAGE_KEYS.THEME, theme);
}
