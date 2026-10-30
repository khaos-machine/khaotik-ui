export default SetupProgress;
type SetupProgress = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const SetupProgress: import("svelte").Component<{
    /**
     * What is being provisioned — "Provisioning MLX Audio". The subject, supplied by the host; this component does not know which service it is looking at.
     */
    title?: string;
    /**
     * The honest copy that carries what a percentage would have claimed falsely — "This may take a few minutes. Do not close the app." Absent renders nothing rather than a default sentence, because how long a host's work takes is not a fact this component holds. It is NOT the accessible carrier of `busy` — see `busyLabel`.
     */
    note?: string;
    /**
     * Work is in flight. CONSUMER-SET AND NEVER INFERRED, the same contract as `ServiceStatusList.pendingId`: output arriving is not proof work is still running, and a component that spun because lines appeared would be asserting something it never observed. Defaults `false`, so a caller that says nothing produces no claim.
     */
    busy?: boolean;
    /**
     * The accessible equivalent of the spinner, rendered in a `.visually-hidden` span whenever `busy` is set. Defaults to `'Working…'` — a DEFAULT AND NOT AN EMPTY STRING, because the spinner is `aria-hidden` and without this a screen-reader user is told nothing at all while five minutes of provisioning runs.
     */
    busyLabel?: string;
    /**
     * The step feed. Empty means NOBODY HAS REPORTED A STEP, which is not the same as no steps existing — the empty copy says so.
     */
    steps?: readonly {
        /**
         * The step khaosd names — `python`, `venv`, `apple_silicon`, `packages`, `weights`. Rendered verbatim; there is no display-name table, because inventing one means guessing at a vocabulary the daemon owns.
         */
        name: string;
        /**
         * Typed `string`, with the four `StepState` members named in this docblock and NOWHERE ELSE IN THE TYPE — `pending`, `passed`, `failed`, `skipped`. Absent, or unrecognised, renders NEUTRAL: neither a pass nor a failure has been reported. `string` and not a closed union because `StepState` is open at the producer — khaos-manager can add a member and this client receives it unfiltered — and not `(string & {})` because that intersection measures as `string` anyway through this package, so the named members never reach a consumer's editor. Pinned by `scripts/check-consumer.mjs`; see the `package_stage` measurement at `lib/types.js:127-143`.
         */
        state?: string;
        /**
         * The step's own sentence — a resolved interpreter path, a venv location, a failure reason. Rendered verbatim and never truncated, as `OutcomeBanner`'s detail is (`OutcomeBanner.svelte:126-135`).
         */
        detail?: string;
    }[];
    /**
     * The provisioning transcript, rendered VERBATIM — never rewritten, reformatted or "fixed", the rule `InstallScript.svelte:19` already holds. Joined with newlines into one text node so the operator can select and copy exactly what khaosd wrote.
     */
    lines?: readonly string[];
    /**
     * Whether the transcript disclosure is expanded. Collapsed by default: collapsed the operator gets a calm screen, expanded they get proof.
     */
    open?: boolean;
    /**
     * Called with the state being requested. **Omit it and the disclosure control renders DISABLED rather than absent** — the house contract `InstallScript.onCopy` and `ServiceStatusList`'s row actions both use. A host that renders a transcript it will not let anyone open should have that visible.
     */
    onToggle?: (open: boolean) => void;
    /**
     * The disclosure's word while COLLAPSED.
     */
    label?: string;
    /**
     * The disclosure's word while EXPANDED. Two props, not one: a control that still reads "Show setup details" over an open panel is a false statement, which is the defect class D71 and D72 both turn on.
     */
    openLabel?: string;
    /**
     * Shown inside the open disclosure when nothing has been emitted yet — which is NOT the same as finished, and the copy must not let the two be read as one. Renders as a sibling of the `<pre>`, never inside it.
     */
    emptyLabel?: string;
    /**
     * `card` (default) keeps the border and radius that separate this from its siblings in a gallery. `surface` drops them for a full-window mount, so a host does not reach into component internals for a layout the component should offer. The full-window TAKEOVER is the host's — this component owns no viewport and starts no mode.
     */
    variant?: "card" | "surface";
}, {}, "">;
type Props = {
    /**
     * What is being provisioned — "Provisioning MLX Audio". The subject, supplied by the host; this component does not know which service it is looking at.
     */
    title?: string;
    /**
     * The honest copy that carries what a percentage would have claimed falsely — "This may take a few minutes. Do not close the app." Absent renders nothing rather than a default sentence, because how long a host's work takes is not a fact this component holds. It is NOT the accessible carrier of `busy` — see `busyLabel`.
     */
    note?: string;
    /**
     * Work is in flight. CONSUMER-SET AND NEVER INFERRED, the same contract as `ServiceStatusList.pendingId`: output arriving is not proof work is still running, and a component that spun because lines appeared would be asserting something it never observed. Defaults `false`, so a caller that says nothing produces no claim.
     */
    busy?: boolean;
    /**
     * The accessible equivalent of the spinner, rendered in a `.visually-hidden` span whenever `busy` is set. Defaults to `'Working…'` — a DEFAULT AND NOT AN EMPTY STRING, because the spinner is `aria-hidden` and without this a screen-reader user is told nothing at all while five minutes of provisioning runs.
     */
    busyLabel?: string;
    /**
     * The step feed. Empty means NOBODY HAS REPORTED A STEP, which is not the same as no steps existing — the empty copy says so.
     */
    steps?: readonly {
        /**
         * The step khaosd names — `python`, `venv`, `apple_silicon`, `packages`, `weights`. Rendered verbatim; there is no display-name table, because inventing one means guessing at a vocabulary the daemon owns.
         */
        name: string;
        /**
         * Typed `string`, with the four `StepState` members named in this docblock and NOWHERE ELSE IN THE TYPE — `pending`, `passed`, `failed`, `skipped`. Absent, or unrecognised, renders NEUTRAL: neither a pass nor a failure has been reported. `string` and not a closed union because `StepState` is open at the producer — khaos-manager can add a member and this client receives it unfiltered — and not `(string & {})` because that intersection measures as `string` anyway through this package, so the named members never reach a consumer's editor. Pinned by `scripts/check-consumer.mjs`; see the `package_stage` measurement at `lib/types.js:127-143`.
         */
        state?: string;
        /**
         * The step's own sentence — a resolved interpreter path, a venv location, a failure reason. Rendered verbatim and never truncated, as `OutcomeBanner`'s detail is (`OutcomeBanner.svelte:126-135`).
         */
        detail?: string;
    }[];
    /**
     * The provisioning transcript, rendered VERBATIM — never rewritten, reformatted or "fixed", the rule `InstallScript.svelte:19` already holds. Joined with newlines into one text node so the operator can select and copy exactly what khaosd wrote.
     */
    lines?: readonly string[];
    /**
     * Whether the transcript disclosure is expanded. Collapsed by default: collapsed the operator gets a calm screen, expanded they get proof.
     */
    open?: boolean;
    /**
     * Called with the state being requested. **Omit it and the disclosure control renders DISABLED rather than absent** — the house contract `InstallScript.onCopy` and `ServiceStatusList`'s row actions both use. A host that renders a transcript it will not let anyone open should have that visible.
     */
    onToggle?: (open: boolean) => void;
    /**
     * The disclosure's word while COLLAPSED.
     */
    label?: string;
    /**
     * The disclosure's word while EXPANDED. Two props, not one: a control that still reads "Show setup details" over an open panel is a false statement, which is the defect class D71 and D72 both turn on.
     */
    openLabel?: string;
    /**
     * Shown inside the open disclosure when nothing has been emitted yet — which is NOT the same as finished, and the copy must not let the two be read as one. Renders as a sibling of the `<pre>`, never inside it.
     */
    emptyLabel?: string;
    /**
     * `card` (default) keeps the border and radius that separate this from its siblings in a gallery. `surface` drops them for a full-window mount, so a host does not reach into component internals for a layout the component should offer. The full-window TAKEOVER is the host's — this component owns no viewport and starts no mode.
     */
    variant?: "card" | "surface";
};
