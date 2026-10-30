export default ProjectReferencePicker;
type ProjectReferencePicker = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<$$ComponentProps>): void;
};
declare const ProjectReferencePicker: import("svelte").Component<{
    references?: readonly {
        id: string;
        label: string;
        subjectName?: string;
        subject?: {
            kind: string;
        };
        roles?: readonly string[];
    }[];
    selected?: readonly {
        referenceId: string;
        role: string;
    }[];
    imageURLs?: Record<string, string>;
    oninspect?: (id: string) => void;
    onchoose?: (id: string, role: string) => void;
    onclose?: () => void;
}, {}, "">;
type $$ComponentProps = {
    references?: readonly {
        id: string;
        label: string;
        subjectName?: string;
        subject?: {
            kind: string;
        };
        roles?: readonly string[];
    }[];
    selected?: readonly {
        referenceId: string;
        role: string;
    }[];
    imageURLs?: Record<string, string>;
    oninspect?: (id: string) => void;
    onchoose?: (id: string, role: string) => void;
    onclose?: () => void;
};
