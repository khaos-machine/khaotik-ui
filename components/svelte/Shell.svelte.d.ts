export default Shell;
type Shell = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const Shell: import("svelte").Component<{
    /**
     * The window's title: the story's name.
     */
    title?: string;
    /**
     * What the player is on, right-aligned in the toolbar.
     */
    context?: string;
    /**
     * Data, Atlas, Player or Composer, Screenplay: the presentations offered.
     */
    modes?: {
        value: string;
        label: string;
    }[] | undefined;
    /**
     * The presentation shown.
     */
    presentation?: "overview" | "data" | "atlas" | "player" | "screenplay";
    /**
     * A presentation was chosen.
     */
    onPresentation?: (mode: string) => void;
    /**
     * The pane toggles.
     */
    panes?: {
        id: string;
        label: string;
        icon?: string;
        shown: boolean;
    }[] | undefined;
    /**
     * A pane toggle was pressed.
     */
    onTogglePane?: (id: string) => void;
    /**
     * The toolbar's commands.
     */
    commands?: import("./lib/commands").Command[] | undefined;
    /**
     * An enabled command was chosen.
     */
    onRun?: (id: string) => void;
    /**
     * The filter text; null hides the field.
     */
    filter?: string | null;
    /**
     * The filter's accessible name.
     */
    filterLabel?: string;
    /**
     * The filter text changed.
     */
    onFilter?: (value: string) => void;
    /**
     * A click anywhere in the toolbar row, so the host can say why a disabled command is disabled.
     */
    onToolbarClick?: (event: MouseEvent) => void;
    /**
     * Why the shared story read failed; '' when it did not.
     */
    snapshotError?: string;
    /**
     * Retry was pressed after the story read failed.
     */
    onRetrySnapshot?: () => void;
    /**
     * Opens the story's Project Settings, from the gear at the toolbar's trailing edge. Absent, no gear is drawn.
     */
    onProjectSettings?: () => void;
    /**
     * The atlas lens, shown while the atlas is.
     */
    atlasLens?: string;
    /**
     * An atlas lens was chosen.
     */
    onAtlasLens?: (lens: string) => void;
    /**
     * The data workspace: story or review.
     */
    workspace?: string;
    /**
     * The data workspaces offered.
     */
    workspaces?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * A workspace was chosen.
     */
    onWorkspace?: (workspace: string) => void;
    /**
     * The panes' layout.
     */
    layout?: import("./lib/dock.js").DockNode | null | undefined;
    /**
     * Every pane the layout may name.
     */
    panels?: Record<string, import("./lib/dock.js").DockPanel> | undefined;
    /**
     * The panes were resized, moved or collapsed.
     */
    onLayoutChange?: (layout: import("./lib/dock.js").DockNode) => void;
    /**
     * The source list's destinations.
     */
    sections?: import("svelte").ComponentProps<typeof SourceList>["sections"];
    /**
     * The destination shown.
     */
    destination?: string;
    /**
     * A destination was chosen in the source list.
     */
    onDestination?: (destination: string) => void;
    /**
     * A subject builder covers the window: everything else is hidden and inert.
     */
    builderOpen?: boolean;
    /**
     * The status bar's engine line.
     */
    engine?: {
        state: "ready" | "starting" | "offline" | string;
        label: string;
    } | null | undefined;
    /**
     * Running jobs.
     */
    jobs?: readonly {
        id: string;
        label: string;
        progress?: {
            readonly completed: number;
            readonly total: number;
        };
        elapsedMs?: number;
        remainingMs?: number;
        cancel?: () => void;
    }[] | undefined;
    /**
     * The last action's result.
     */
    result?: {
        text: string;
        tone?: "info" | "error";
        undo?: () => void;
        dismiss?: () => void;
    } | null | undefined;
    /**
     * The story budget in the status bar.
     */
    budget?: {
        kind: "reading";
    } | {
        kind: "none";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        usd: string;
        spentUsd: string;
        remainingUsd: string;
    } | null | undefined;
    /**
     * Opens the story's budget.
     */
    onchangebudget?: (() => void) | undefined;
    /**
     * The command palette is open.
     */
    paletteOpen?: boolean;
    /**
     * What the palette offers.
     */
    paletteCommands?: import("svelte").ComponentProps<typeof CommandPalette>["commands"];
    /**
     * A palette command was chosen.
     */
    onPaletteRun?: (id: string) => void;
    /**
     * The palette was dismissed.
     */
    onPaletteClose?: () => void;
    /**
     * The table pane for the destination shown.
     */
    table?: import("svelte").Snippet | undefined;
    /**
     * The detail pane.
     */
    detail?: import("svelte").Snippet | undefined;
    /**
     * The inspector pane.
     */
    side?: import("svelte").Snippet | undefined;
    /**
     * Any other pane, by id: the review workspace's.
     */
    pane?: import("svelte").Snippet<[string]> | undefined;
    /**
     * What a refused action offers. It shows above every layer, open builders included, so the surface that was refused shows its fix.
     */
    notice?: import("svelte").Snippet | undefined;
    /**
     * The overview layer, with the status bar under it as under the data.
     */
    overview?: import("svelte").Snippet | undefined;
    /**
     * The atlas layer; absent, it is not offered.
     */
    atlas?: import("svelte").Snippet | undefined;
    /**
     * The player layer.
     */
    player?: import("svelte").Snippet | undefined;
    /**
     * The screenplay layer.
     */
    screenplay?: import("svelte").Snippet | undefined;
    /**
     * The subject builders. They cover the window while one is open; the host hides each one that is not.
     */
    builders?: import("svelte").Snippet | undefined;
    /**
     * The host's sheets and confirmations.
     */
    dialogs?: import("svelte").Snippet | undefined;
}, {}, "">;
type Props = {
    /**
     * The window's title: the story's name.
     */
    title?: string;
    /**
     * What the player is on, right-aligned in the toolbar.
     */
    context?: string;
    /**
     * Data, Atlas, Player or Composer, Screenplay: the presentations offered.
     */
    modes?: {
        value: string;
        label: string;
    }[] | undefined;
    /**
     * The presentation shown.
     */
    presentation?: "overview" | "data" | "atlas" | "player" | "screenplay";
    /**
     * A presentation was chosen.
     */
    onPresentation?: (mode: string) => void;
    /**
     * The pane toggles.
     */
    panes?: {
        id: string;
        label: string;
        icon?: string;
        shown: boolean;
    }[] | undefined;
    /**
     * A pane toggle was pressed.
     */
    onTogglePane?: (id: string) => void;
    /**
     * The toolbar's commands.
     */
    commands?: import("./lib/commands").Command[] | undefined;
    /**
     * An enabled command was chosen.
     */
    onRun?: (id: string) => void;
    /**
     * The filter text; null hides the field.
     */
    filter?: string | null;
    /**
     * The filter's accessible name.
     */
    filterLabel?: string;
    /**
     * The filter text changed.
     */
    onFilter?: (value: string) => void;
    /**
     * A click anywhere in the toolbar row, so the host can say why a disabled command is disabled.
     */
    onToolbarClick?: (event: MouseEvent) => void;
    /**
     * Why the shared story read failed; '' when it did not.
     */
    snapshotError?: string;
    /**
     * Retry was pressed after the story read failed.
     */
    onRetrySnapshot?: () => void;
    /**
     * Opens the story's Project Settings, from the gear at the toolbar's trailing edge. Absent, no gear is drawn.
     */
    onProjectSettings?: () => void;
    /**
     * The atlas lens, shown while the atlas is.
     */
    atlasLens?: string;
    /**
     * An atlas lens was chosen.
     */
    onAtlasLens?: (lens: string) => void;
    /**
     * The data workspace: story or review.
     */
    workspace?: string;
    /**
     * The data workspaces offered.
     */
    workspaces?: readonly {
        value: string;
        label: string;
    }[];
    /**
     * A workspace was chosen.
     */
    onWorkspace?: (workspace: string) => void;
    /**
     * The panes' layout.
     */
    layout?: import("./lib/dock.js").DockNode | null | undefined;
    /**
     * Every pane the layout may name.
     */
    panels?: Record<string, import("./lib/dock.js").DockPanel> | undefined;
    /**
     * The panes were resized, moved or collapsed.
     */
    onLayoutChange?: (layout: import("./lib/dock.js").DockNode) => void;
    /**
     * The source list's destinations.
     */
    sections?: import("svelte").ComponentProps<typeof SourceList>["sections"];
    /**
     * The destination shown.
     */
    destination?: string;
    /**
     * A destination was chosen in the source list.
     */
    onDestination?: (destination: string) => void;
    /**
     * A subject builder covers the window: everything else is hidden and inert.
     */
    builderOpen?: boolean;
    /**
     * The status bar's engine line.
     */
    engine?: {
        state: "ready" | "starting" | "offline" | string;
        label: string;
    } | null | undefined;
    /**
     * Running jobs.
     */
    jobs?: readonly {
        id: string;
        label: string;
        progress?: {
            readonly completed: number;
            readonly total: number;
        };
        elapsedMs?: number;
        remainingMs?: number;
        cancel?: () => void;
    }[] | undefined;
    /**
     * The last action's result.
     */
    result?: {
        text: string;
        tone?: "info" | "error";
        undo?: () => void;
        dismiss?: () => void;
    } | null | undefined;
    /**
     * The story budget in the status bar.
     */
    budget?: {
        kind: "reading";
    } | {
        kind: "none";
    } | {
        kind: "failed";
        message: string;
    } | {
        kind: "loaded";
        usd: string;
        spentUsd: string;
        remainingUsd: string;
    } | null | undefined;
    /**
     * Opens the story's budget.
     */
    onchangebudget?: (() => void) | undefined;
    /**
     * The command palette is open.
     */
    paletteOpen?: boolean;
    /**
     * What the palette offers.
     */
    paletteCommands?: import("svelte").ComponentProps<typeof CommandPalette>["commands"];
    /**
     * A palette command was chosen.
     */
    onPaletteRun?: (id: string) => void;
    /**
     * The palette was dismissed.
     */
    onPaletteClose?: () => void;
    /**
     * The table pane for the destination shown.
     */
    table?: import("svelte").Snippet | undefined;
    /**
     * The detail pane.
     */
    detail?: import("svelte").Snippet | undefined;
    /**
     * The inspector pane.
     */
    side?: import("svelte").Snippet | undefined;
    /**
     * Any other pane, by id: the review workspace's.
     */
    pane?: import("svelte").Snippet<[string]> | undefined;
    /**
     * What a refused action offers. It shows above every layer, open builders included, so the surface that was refused shows its fix.
     */
    notice?: import("svelte").Snippet | undefined;
    /**
     * The overview layer, with the status bar under it as under the data.
     */
    overview?: import("svelte").Snippet | undefined;
    /**
     * The atlas layer; absent, it is not offered.
     */
    atlas?: import("svelte").Snippet | undefined;
    /**
     * The player layer.
     */
    player?: import("svelte").Snippet | undefined;
    /**
     * The screenplay layer.
     */
    screenplay?: import("svelte").Snippet | undefined;
    /**
     * The subject builders. They cover the window while one is open; the host hides each one that is not.
     */
    builders?: import("svelte").Snippet | undefined;
    /**
     * The host's sheets and confirmations.
     */
    dialogs?: import("svelte").Snippet | undefined;
};
import SourceList from './SourceList.svelte';
import CommandPalette from './CommandPalette.svelte';
