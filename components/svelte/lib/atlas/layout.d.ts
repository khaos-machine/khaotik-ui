/** Geometry only: every lens, neighborhood and region membership is supplied by khaosd. */
export function createLayouts(atlas: any): {
    layout: (variant: any, selectedId: any) => any;
    contributionLayout: (kind: any) => {
        nodes: any[];
        edges: any;
        width: number;
        height: number;
        contribution: boolean;
    };
    sequenceLayout: () => {
        nodes: any;
        edges: any;
        sequence: any;
        labelSpacing: number;
        width: number;
        height: number;
    };
    withSequence: (graph: any) => any;
    neighbors: (id: any) => Set<any>;
    nodes: any;
};
