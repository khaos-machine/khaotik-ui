/** The hue, 0–359, for an entity key. One of 16 evenly spaced stops (#42). */
export function identityHue(key: any): number;
/** The chroma for an entity key: one of two tiers, both in sRGB gamut at every hue (#42). */
export function identityChroma(key: any): number;
/**
 * The identity colour for an entity key.
 *
 * Fixed lightness so every identity sits at the same visual weight — a hue wheel with
 * varying lightness reads as some entities being more important than others.
 */
export function identityColor(key: any): string;
