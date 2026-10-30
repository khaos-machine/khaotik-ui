export default ProjectCard;
type ProjectCard = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const ProjectCard: import("svelte").Component<{
    /**
     * The project/story: `{ title?, logline?, summary?, scene_count?, character_count?, location_count?, monogram?, parsed?, ingested?, needs_migration?, package_stage?, git_repo?, git_has_remote?, git_has_upstream?, git_ahead_count?, git_behind_count?, modified? }`. `package_stage` (RFC 0067 §2, KSPD) is how far the package has been PROCESSED — `empty` | `imported` | `parsed` | `indexed` | `enriched`, and any member a later producer adds. The chip reports the **furthest position known to be true**: `empty` and `imported` outrank even a completed analysis, because they assert there is nothing to analyse and no reader infers them, so a `complete` behind one is stale. `parsed` | `indexed` | `enriched` sit BELOW progressed analysis — they concede content exists, so they cannot contradict a count of work done over it. Analysis progress comes from `analyses`, the same reports the rail draws: all three done reads `Complete`, and otherwise the first analysis in rail order that is in progress or failed names the label with its own count (`Analyzing scenes 56/57`). A member this build does not recognise renders as itself in the neutral tone, making no claim, and sits below analysis too. An empty string is NO CLAIM, not the `empty` member; a parsed package with no stage reads `Parsed`. **The ahead/behind counts are optional and khaosd 0.4.11 does not return them** — with both absent the git chip renders nothing rather than claiming `synced`, which would be a fabricated value.
     */
    project?: Readonly<import("./lib/types.js").Project>;
    /**
     * Cover art (1x). With a cover the monogram is replaced and a per-project identity tint is laid over the image, so a grid of cards stays scannable when every project shares placeholder art. Without one, the card keeps its monogram.
     */
    cover?: string;
    /**
     * Optional srcset for higher-density displays. Omitted entirely when empty — an empty srcset is a candidate list browsers can fail to resolve.
     */
    coverSrcset?: string;
    /**
     * Invoked when the card surface is activated.
     */
    onOpen?: (event: MouseEvent) => void;
    /**
     * When set, shows **Remove from Recents** and binds its invocation. It removes the project from the host's recent list and never deletes it: a person deletes a project in the Finder (project portability plan, D1). Hidden when omitted.
     */
    onRemove?: (event: MouseEvent) => void;
    /**
     * When set **and the project has no repo**, shows the git-init button and binds its invocation. Not offered once `project.git_repo` is true — there is nothing to initialise. This prop was previously accepted and never used: the card took the handler and dropped it, so a launcher wiring git-init got silence.
     */
    onInitGit?: (event: MouseEvent) => void;
    /**
     * A background job running on this project — an import or an extraction — as the host knows it. Omit when there is none, and the card shows the package stage. It outranks the stage chip whatever the stage is. An unknown `kind` or `phase` renders no job. During an import the meta row and every action are hidden. Durations that are not finite and non-negative render nothing; the timing sits in the `aria-hidden` footer, so a value refreshed every second is never announced.
     */
    job?: import("./lib/types.js").ProjectJob;
    /**
     * Invoked by the parsed-package extraction action, offered with no job or a failed extraction.
     */
    onExtract?: (event: MouseEvent) => void;
    /**
     * What the host knows of the three analyses — scenes, characters, places — drawn as the rail's last three segments, placed by `kind`. An analysis that is absent, or whose `kind` or `state` this build does not recognise, renders as an empty segment titled "not reported", never as "not started". A live analysis `job` outranks the report for its segment.
     */
    analyses?: readonly import("./lib/types.js").ProjectAnalysis[];
    /**
     * The host's content below the footer — what a failed job offers (a fix, Report a Problem…), which only the host can choose. Rendered whatever the job, raised above the card's activate overlay so its controls take the click, and outside the `aria-hidden` footer so they are announced. Omit it and the card draws no empty slot.
     */
    children?: import("svelte").Snippet;
}, {}, "">;
type Props = {
    /**
     * The project/story: `{ title?, logline?, summary?, scene_count?, character_count?, location_count?, monogram?, parsed?, ingested?, needs_migration?, package_stage?, git_repo?, git_has_remote?, git_has_upstream?, git_ahead_count?, git_behind_count?, modified? }`. `package_stage` (RFC 0067 §2, KSPD) is how far the package has been PROCESSED — `empty` | `imported` | `parsed` | `indexed` | `enriched`, and any member a later producer adds. The chip reports the **furthest position known to be true**: `empty` and `imported` outrank even a completed analysis, because they assert there is nothing to analyse and no reader infers them, so a `complete` behind one is stale. `parsed` | `indexed` | `enriched` sit BELOW progressed analysis — they concede content exists, so they cannot contradict a count of work done over it. Analysis progress comes from `analyses`, the same reports the rail draws: all three done reads `Complete`, and otherwise the first analysis in rail order that is in progress or failed names the label with its own count (`Analyzing scenes 56/57`). A member this build does not recognise renders as itself in the neutral tone, making no claim, and sits below analysis too. An empty string is NO CLAIM, not the `empty` member; a parsed package with no stage reads `Parsed`. **The ahead/behind counts are optional and khaosd 0.4.11 does not return them** — with both absent the git chip renders nothing rather than claiming `synced`, which would be a fabricated value.
     */
    project?: Readonly<import("./lib/types.js").Project>;
    /**
     * Cover art (1x). With a cover the monogram is replaced and a per-project identity tint is laid over the image, so a grid of cards stays scannable when every project shares placeholder art. Without one, the card keeps its monogram.
     */
    cover?: string;
    /**
     * Optional srcset for higher-density displays. Omitted entirely when empty — an empty srcset is a candidate list browsers can fail to resolve.
     */
    coverSrcset?: string;
    /**
     * Invoked when the card surface is activated.
     */
    onOpen?: (event: MouseEvent) => void;
    /**
     * When set, shows **Remove from Recents** and binds its invocation. It removes the project from the host's recent list and never deletes it: a person deletes a project in the Finder (project portability plan, D1). Hidden when omitted.
     */
    onRemove?: (event: MouseEvent) => void;
    /**
     * When set **and the project has no repo**, shows the git-init button and binds its invocation. Not offered once `project.git_repo` is true — there is nothing to initialise. This prop was previously accepted and never used: the card took the handler and dropped it, so a launcher wiring git-init got silence.
     */
    onInitGit?: (event: MouseEvent) => void;
    /**
     * A background job running on this project — an import or an extraction — as the host knows it. Omit when there is none, and the card shows the package stage. It outranks the stage chip whatever the stage is. An unknown `kind` or `phase` renders no job. During an import the meta row and every action are hidden. Durations that are not finite and non-negative render nothing; the timing sits in the `aria-hidden` footer, so a value refreshed every second is never announced.
     */
    job?: import("./lib/types.js").ProjectJob;
    /**
     * Invoked by the parsed-package extraction action, offered with no job or a failed extraction.
     */
    onExtract?: (event: MouseEvent) => void;
    /**
     * What the host knows of the three analyses — scenes, characters, places — drawn as the rail's last three segments, placed by `kind`. An analysis that is absent, or whose `kind` or `state` this build does not recognise, renders as an empty segment titled "not reported", never as "not started". A live analysis `job` outranks the report for its segment.
     */
    analyses?: readonly import("./lib/types.js").ProjectAnalysis[];
    /**
     * The host's content below the footer — what a failed job offers (a fix, Report a Problem…), which only the host can choose. Rendered whatever the job, raised above the card's activate overlay so its controls take the click, and outside the `aria-hidden` footer so they are announced. Omit it and the card draws no empty slot.
     */
    children?: import("svelte").Snippet;
};
