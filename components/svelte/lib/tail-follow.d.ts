/** How close to the bottom still counts as "at the bottom", in CSS pixels. */
export const STICK_THRESHOLD_PX: 24;
export function shouldFollow(metrics: {
    scrollTop?: number;
    clientHeight?: number;
    scrollHeight?: number;
} | null, threshold?: number): boolean;
