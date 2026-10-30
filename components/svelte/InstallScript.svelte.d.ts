export default InstallScript;
type InstallScript = {
    $on?(type: string, callback: (e: any) => void): () => void;
    $set?(props: Partial<Props>): void;
};
declare const InstallScript: import("svelte").Component<{
    /**
     * The generated shell, verbatim. Rendered exactly as given — this component never rewrites, reformats or "fixes" it, because the text on screen has to be the text that runs.
     */
    script?: string;
    /**
     * The package manager it targets, e.g. `Homebrew`, `apt`, `dnf`, `pacman`, `zypper`. Shown so the operator can tell at a glance that we detected the right one.
     */
    manager?: string;
    /**
     * **Omit it and Copy renders disabled** rather than absent, the same contract `ServiceStatusList` uses for its row actions. Copy is also refused — regardless of this prop — when the script contains characters that would make the rendering lie; see `suspect`.
     */
    onCopy?: () => void;
    /**
     * Shown when there is no script, which is the good case: nothing to install.
     */
    emptyLabel?: string;
}, {}, "">;
type Props = {
    /**
     * The generated shell, verbatim. Rendered exactly as given — this component never rewrites, reformats or "fixes" it, because the text on screen has to be the text that runs.
     */
    script?: string;
    /**
     * The package manager it targets, e.g. `Homebrew`, `apt`, `dnf`, `pacman`, `zypper`. Shown so the operator can tell at a glance that we detected the right one.
     */
    manager?: string;
    /**
     * **Omit it and Copy renders disabled** rather than absent, the same contract `ServiceStatusList` uses for its row actions. Copy is also refused — regardless of this prop — when the script contains characters that would make the rendering lie; see `suspect`.
     */
    onCopy?: () => void;
    /**
     * Shown when there is no script, which is the good case: nothing to install.
     */
    emptyLabel?: string;
};
