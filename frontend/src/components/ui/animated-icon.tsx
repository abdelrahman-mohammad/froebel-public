"use client";

import Image from "next/image";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";

import { ICON_SIZES, TRANSITIONS, getTransition } from "@/lib/animations/sidebar-animations";
import { cn } from "@/lib/utils";

interface AnimatedLucideIconProps {
    icon: LucideIcon;
    className?: string;
    /** Additional classes applied to the icon itself */
    iconClassName?: string;
}

/**
 * Animates a Lucide icon between expanded (16px) and collapsed (20px) states.
 * Uses spring physics for smooth transitions.
 *
 * The outer wrapper animates width from icon size to 100%, causing the icon
 * to smoothly center as the sidebar collapses (instead of jumping to center).
 */
export function AnimatedLucideIcon({
    icon: Icon,
    className,
    iconClassName,
}: AnimatedLucideIconProps) {
    const { state } = useSidebar();
    const shouldReduceMotion = useReducedMotion();
    const isCollapsed = state === "collapsed";
    const iconSize = isCollapsed ? ICON_SIZES.collapsed.lucide : ICON_SIZES.expanded.lucide;

    return (
        <motion.div
            className={cn("flex items-center justify-center", className)}
            animate={{ width: isCollapsed ? "100%" : iconSize }}
            transition={getTransition(TRANSITIONS.iconScale, shouldReduceMotion ?? false)}
        >
            <motion.div
                className="shrink-0"
                animate={{ width: iconSize, height: iconSize }}
                transition={getTransition(TRANSITIONS.iconScale, shouldReduceMotion ?? false)}
            >
                <Icon className={cn("w-full h-full", iconClassName)} />
            </motion.div>
        </motion.div>
    );
}

interface AnimatedImageIconProps {
    src: string;
    alt?: string;
    className?: string;
    /** Border radius class, defaults to rounded-lg */
    rounded?: string;
}

/**
 * Animates an image icon between expanded (16px) and collapsed (28px) states.
 * Used for quiz thumbnails that need to be more prominent when collapsed.
 *
 * The outer wrapper animates width from icon size to 100%, causing the icon
 * to smoothly center as the sidebar collapses (instead of jumping to center).
 */
export function AnimatedImageIcon({
    src,
    alt = "",
    className,
    rounded = "rounded-lg",
}: AnimatedImageIconProps) {
    const { state } = useSidebar();
    const shouldReduceMotion = useReducedMotion();
    const isCollapsed = state === "collapsed";
    const iconSize = isCollapsed ? ICON_SIZES.collapsed.image : ICON_SIZES.expanded.image;

    return (
        <motion.div
            className={cn("flex items-center justify-center", className)}
            animate={{ width: isCollapsed ? "100%" : iconSize }}
            transition={getTransition(TRANSITIONS.iconScale, shouldReduceMotion ?? false)}
        >
            <motion.div
                className={cn("shrink-0 overflow-hidden", rounded)}
                animate={{ width: iconSize, height: iconSize }}
                transition={getTransition(TRANSITIONS.iconScale, shouldReduceMotion ?? false)}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                />
            </motion.div>
        </motion.div>
    );
}

interface AnimatedMenuTextProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Animates menu item text opacity and visibility during sidebar collapse.
 * Text fades out at the END of the collapse animation (delayed), but appears
 * immediately when expanding.
 */
export function AnimatedMenuText({ children, className }: AnimatedMenuTextProps) {
    const { state } = useSidebar();
    const shouldReduceMotion = useReducedMotion();
    const isCollapsed = state === "collapsed";

    // Delay text fade when collapsing so it stays visible during most of the animation
    // No delay when expanding - text should appear immediately
    const textTransition = shouldReduceMotion
        ? { duration: 0 }
        : {
              opacity: {
                  ...TRANSITIONS.textFade,
                  delay: isCollapsed ? 0.15 : 0, // 150ms delay only when collapsing
              },
              width: {
                  ...TRANSITIONS.textFade,
                  delay: isCollapsed ? 0.15 : 0,
              },
          };

    return (
        <motion.span
            className={cn("truncate whitespace-nowrap", className)}
            animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : "auto",
            }}
            transition={textTransition}
        >
            {children}
        </motion.span>
    );
}
