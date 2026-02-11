/**
 * Centralized animation configuration for sidebar components.
 * Uses Framer Motion spring physics for smooth, natural animations.
 */
import type { Transition } from "framer-motion";

// Spring configurations for different animation types
export const SPRING_CONFIG = {
    // Snappy spring for quick interactions (sidebar toggle, icon scaling)
    snappy: {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
        mass: 1,
    },
    // Gentle spring for content reveals (section expand/collapse)
    gentle: {
        type: "spring" as const,
        stiffness: 300,
        damping: 35,
        mass: 1,
    },
    // Smooth spring for subtle transitions (opacity, text)
    smooth: {
        type: "spring" as const,
        stiffness: 200,
        damping: 25,
        mass: 0.8,
    },
} as const;

// Transition presets for common patterns
export const TRANSITIONS = {
    // Sidebar width changes
    sidebarWidth: SPRING_CONFIG.snappy,
    // Icon size scaling
    iconScale: SPRING_CONFIG.snappy,
    // Text fade out/in
    textFade: SPRING_CONFIG.smooth,
    // Section collapse/expand
    sectionCollapse: SPRING_CONFIG.gentle,
    // Layout animations for gaps/spacing
    layout: SPRING_CONFIG.gentle,
} as const;

// Duration fallbacks for non-spring animations (seconds)
export const DURATIONS = {
    fast: 0.15,
    default: 0.25,
    slow: 0.35,
} as const;

// Icon sizes based on collapsed state (in pixels)
export const ICON_SIZES = {
    expanded: {
        lucide: 16, // size-4 = 1rem = 16px
        image: 16, // size-4 = 1rem = 16px
    },
    collapsed: {
        lucide: 20, // size-5 = 1.25rem = 20px (regular icons)
        image: 28, // size-7 = 1.75rem = 28px (quiz thumbnails)
    },
} as const;

// Stagger animation variants for lists
export const staggerContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.05,
        },
    },
};

export const staggerItemVariants = {
    hidden: {
        opacity: 0,
        x: -8,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: SPRING_CONFIG.smooth,
    },
};

// Helper to create transition with reduced motion support
export function getTransition(
    config: (typeof TRANSITIONS)[keyof typeof TRANSITIONS],
    shouldReduceMotion: boolean
): Transition {
    if (shouldReduceMotion) {
        return { duration: 0 };
    }
    return config;
}
