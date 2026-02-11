"use client";

import { useCallback, useEffect, useState } from "react";

// Types
export interface DayActivity {
    day: string;
    date: Date;
    xpEarned: number;
    goalMet: boolean;
}

export interface RecommendedQuiz {
    id: string;
    title: string;
    category: string;
    difficulty: "easy" | "medium" | "hard";
    questionCount: number;
    estimatedXP: number;
    reason: string;
}

export interface GamificationData {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date | null;
    totalXP: number;
    todayXP: number;
    dailyGoal: number;
    weeklyActivity: DayActivity[];
    recommendedQuizzes: RecommendedQuiz[];
}

interface UseGamificationMockReturn {
    data: GamificationData | null;
    isLoading: boolean;
    error: string | null;
    addXP: (amount: number) => void;
    resetStreak: () => void;
    setDailyGoal: (goal: number) => void;
    refetch: () => Promise<void>;
}

// Storage key
const STORAGE_KEY = "froebel_gamification_mock";

// Helper to get day abbreviation
function getDayAbbr(date: Date): string {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return days[date.getDay()];
}

// Helper to check if two dates are the same day
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

// Helper to get date N days ago
function subDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}

// Generate weekly activity data
function generateWeeklyActivity(dailyGoal: number): DayActivity[] {
    const today = new Date();
    const week: DayActivity[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const isToday = i === 0;
        // Random XP between 0 and 300 for past days, partial for today
        const xpEarned = isToday
            ? Math.floor(Math.random() * dailyGoal * 0.8)
            : Math.floor(Math.random() * 300);

        week.push({
            day: getDayAbbr(date),
            date,
            xpEarned,
            goalMet: xpEarned >= dailyGoal,
        });
    }

    return week;
}

// Default mock quizzes for recommendations
const DEFAULT_RECOMMENDED_QUIZZES: RecommendedQuiz[] = [
    {
        id: "rec-1",
        title: "Cell Biology Fundamentals",
        category: "Biology",
        difficulty: "medium",
        questionCount: 15,
        estimatedXP: 50,
        reason: "Continue learning",
    },
    {
        id: "rec-2",
        title: "Algebra 101",
        category: "Mathematics",
        difficulty: "easy",
        questionCount: 20,
        estimatedXP: 40,
        reason: "Recommended for you",
    },
    {
        id: "rec-3",
        title: "World History: Ancient Civilizations",
        category: "History",
        difficulty: "medium",
        questionCount: 25,
        estimatedXP: 60,
        reason: "Trending",
    },
    {
        id: "rec-4",
        title: "JavaScript Basics",
        category: "Programming",
        difficulty: "easy",
        questionCount: 18,
        estimatedXP: 45,
        reason: "Popular this week",
    },
];

// Generate default data
function generateDefaultData(): GamificationData {
    const dailyGoal = 200;
    const weeklyActivity = generateWeeklyActivity(dailyGoal);
    const todayActivity = weeklyActivity[weeklyActivity.length - 1];

    // Calculate streak from weekly activity
    let streak = 0;
    for (let i = weeklyActivity.length - 2; i >= 0; i--) {
        if (weeklyActivity[i].goalMet) {
            streak++;
        } else {
            break;
        }
    }

    // Add today if goal met
    if (todayActivity.goalMet) {
        streak++;
    }

    return {
        currentStreak: streak,
        longestStreak: Math.max(streak, 14),
        lastActivityDate: new Date(),
        totalXP: 1240 + todayActivity.xpEarned,
        todayXP: todayActivity.xpEarned,
        dailyGoal,
        weeklyActivity,
        recommendedQuizzes: DEFAULT_RECOMMENDED_QUIZZES,
    };
}

// Load from localStorage
function loadFromStorage(): GamificationData | null {
    if (typeof window === "undefined") return null;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);

        // Convert date strings back to Date objects
        return {
            ...parsed,
            lastActivityDate: parsed.lastActivityDate ? new Date(parsed.lastActivityDate) : null,
            weeklyActivity: parsed.weeklyActivity.map(
                (day: { date: string } & Omit<DayActivity, "date">) => ({
                    ...day,
                    date: new Date(day.date),
                })
            ),
        };
    } catch {
        return null;
    }
}

// Save to localStorage
function saveToStorage(data: GamificationData): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // Ignore storage errors
    }
}

export function useGamificationMock(): UseGamificationMockReturn {
    const [data, setData] = useState<GamificationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize data
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        try {
            let gamificationData = loadFromStorage();

            if (!gamificationData) {
                gamificationData = generateDefaultData();
                saveToStorage(gamificationData);
            } else {
                // Check if we need to refresh weekly activity (new day)
                const lastDate =
                    gamificationData.weeklyActivity[gamificationData.weeklyActivity.length - 1]
                        ?.date;
                if (lastDate && !isSameDay(new Date(lastDate), new Date())) {
                    // Regenerate weekly activity for new day
                    gamificationData.weeklyActivity = generateWeeklyActivity(
                        gamificationData.dailyGoal
                    );
                    gamificationData.todayXP = 0;
                    saveToStorage(gamificationData);
                }
            }

            setData(gamificationData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Add XP action
    const addXP = useCallback(
        (amount: number) => {
            if (!data) return;

            const newTodayXP = data.todayXP + amount;
            const newTotalXP = data.totalXP + amount;
            const goalMet = newTodayXP >= data.dailyGoal;

            // Update weekly activity for today
            const updatedWeekly = [...data.weeklyActivity];
            const todayIndex = updatedWeekly.length - 1;
            updatedWeekly[todayIndex] = {
                ...updatedWeekly[todayIndex],
                xpEarned: newTodayXP,
                goalMet,
            };

            // Update streak if goal just met
            let newStreak = data.currentStreak;
            if (goalMet && !data.weeklyActivity[todayIndex].goalMet) {
                newStreak++;
            }

            const updatedData: GamificationData = {
                ...data,
                totalXP: newTotalXP,
                todayXP: newTodayXP,
                currentStreak: newStreak,
                longestStreak: Math.max(data.longestStreak, newStreak),
                lastActivityDate: new Date(),
                weeklyActivity: updatedWeekly,
            };

            setData(updatedData);
            saveToStorage(updatedData);
        },
        [data]
    );

    // Reset streak action
    const resetStreak = useCallback(() => {
        if (!data) return;

        const updatedData: GamificationData = {
            ...data,
            currentStreak: 0,
            todayXP: 0,
            weeklyActivity: data.weeklyActivity.map((day) => ({
                ...day,
                xpEarned: 0,
                goalMet: false,
            })),
        };

        setData(updatedData);
        saveToStorage(updatedData);
    }, [data]);

    // Set daily goal action
    const setDailyGoal = useCallback(
        (goal: number) => {
            if (!data) return;

            const updatedWeekly = data.weeklyActivity.map((day) => ({
                ...day,
                goalMet: day.xpEarned >= goal,
            }));

            const updatedData: GamificationData = {
                ...data,
                dailyGoal: goal,
                weeklyActivity: updatedWeekly,
            };

            setData(updatedData);
            saveToStorage(updatedData);
        },
        [data]
    );

    return {
        data,
        isLoading,
        error,
        addXP,
        resetStreak,
        setDailyGoal,
        refetch: fetchData,
    };
}
