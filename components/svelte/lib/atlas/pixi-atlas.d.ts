/** App-owned WebGL renderer. All story facts come from the canonical engine read. */
export function createAtlas(element: any, callbacks: any): Promise<{
    update: (next: any) => void;
    setActive(active: any): void;
    focus: (id: any, emphasis?: number) => void;
    fit: (animate?: boolean) => void;
    zoom: (factor: any) => Viewport;
    destroy(): void;
}>;
import { Viewport } from 'pixi-viewport';
