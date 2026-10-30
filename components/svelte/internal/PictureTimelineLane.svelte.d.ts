export default PictureTimelineLane;
type PictureTimelineLane = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const PictureTimelineLane: import("svelte").Component<{
    clips?: readonly import("../lib/picture-range.js").PictureClip[];
    scale?: number;
    total?: number;
    selectedId?: string;
    activeId?: string;
    onSelect?: (id: string, source?: "context") => void;
    onAction?: (id: string, action: "add" | "insertBefore" | "insertAfter" | "split" | "delete") => void;
    onChange?: (id: string, range: {
        start: number;
        duration: number;
    }) => void;
}, {}, "">;
type $$ComponentProps = {
    clips?: readonly {
        id: string;
        label: string;
        start: number;
        duration: number;
        imageUrl?: string;
        minStart?: number;
        maxEnd?: number;
        warning?: string;
        readOnly?: boolean;
        chosen?: boolean;
    }[];
    scale?: number;
    total?: number;
    selectedId?: string;
    activeId?: string;
    onSelect?: (id: string, source?: "context") => void;
    onAction?: (id: string, action: "add" | "insertBefore" | "insertAfter" | "split" | "delete") => void;
    onChange?: (id: string, range: {
        start: number;
        duration: number;
    }) => void;
};
