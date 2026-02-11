/**
 * Rate Limiter for AI Grading Requests
 * Limits requests to 10 per minute per provider (server-side singleton)
 */
import type { AIProvider, RateLimitInfo } from "./types";

const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 60000; // 1 minute

class RateLimiter {
    private timestamps: Map<AIProvider, number[]> = new Map();

    /**
     * Check if a request can be made for the given provider
     */
    canMakeRequest(provider: AIProvider): boolean {
        this.cleanupOldTimestamps(provider);
        const timestamps = this.timestamps.get(provider) || [];
        return timestamps.length < RATE_LIMIT;
    }

    /**
     * Record a request for the given provider
     */
    recordRequest(provider: AIProvider): void {
        this.cleanupOldTimestamps(provider);
        const timestamps = this.timestamps.get(provider) || [];
        timestamps.push(Date.now());
        this.timestamps.set(provider, timestamps);
    }

    /**
     * Get the time until the next available slot (0 if available now)
     */
    getTimeUntilNextSlot(provider: AIProvider): number {
        if (this.canMakeRequest(provider)) return 0;
        const timestamps = this.timestamps.get(provider) || [];
        if (timestamps.length === 0) return 0;
        return Math.max(0, WINDOW_MS - (Date.now() - timestamps[0]));
    }

    /**
     * Get full rate limit information for a provider
     */
    getRateLimitInfo(provider: AIProvider): RateLimitInfo {
        this.cleanupOldTimestamps(provider);
        const timestamps = this.timestamps.get(provider) || [];
        return {
            canRequest: timestamps.length < RATE_LIMIT,
            waitTime: this.getTimeUntilNextSlot(provider),
            requestCount: timestamps.length,
        };
    }

    /**
     * Remove timestamps older than the rate limit window
     */
    private cleanupOldTimestamps(provider: AIProvider): void {
        const now = Date.now();
        const timestamps = this.timestamps.get(provider) || [];
        const filtered = timestamps.filter((t) => now - t < WINDOW_MS);
        this.timestamps.set(provider, filtered);
    }

    /**
     * Reset rate limits for a provider (useful for testing)
     */
    reset(provider?: AIProvider): void {
        if (provider) {
            this.timestamps.delete(provider);
        } else {
            this.timestamps.clear();
        }
    }
}

// Server-side singleton instance
export const rateLimiter = new RateLimiter();
