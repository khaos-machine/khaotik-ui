/**
 * The installed components, one row each: `engine.components` when the host passes them, else
 * the three legacy fields in the same shape.
 *
 * @param {{ components?: readonly any[], appVersion?: string, daemonVersion?: string, wflAvailable?: boolean }} engine
 */
export function engineComponents(engine: {
    components?: readonly any[];
    appVersion?: string;
    daemonVersion?: string;
    wflAvailable?: boolean;
}): any[];
/**
 * The engine's state: the host's, else ready when a daemon version is known (learning one takes
 * a successful handshake). `||`, not `??`: khaosd sends `state: ""`, which means none.
 *
 * @param {{ state?: string, daemonVersion?: string, components?: readonly any[] }} engine
 */
export function engineState(engine: {
    state?: string;
    daemonVersion?: string;
    components?: readonly any[];
}): string;
export namespace ENGINE_PILLS {
    namespace ready {
        let text: string;
        let tone: string;
        let icon: string;
    }
    namespace starting {
        let text_1: string;
        export { text_1 as text };
        let tone_1: string;
        export { tone_1 as tone };
        let icon_1: string;
        export { icon_1 as icon };
    }
    namespace setup {
        let text_2: string;
        export { text_2 as text };
        let tone_2: string;
        export { tone_2 as tone };
        let icon_2: string;
        export { icon_2 as icon };
        export let detail: string;
    }
    namespace offline {
        let text_3: string;
        export { text_3 as text };
        let tone_3: string;
        export { tone_3 as tone };
        let icon_3: string;
        export { icon_3 as icon };
    }
}
export function hasExactReleaseVersion(version: unknown): boolean;
export function modelName(route: {
    model: string;
}): string;
