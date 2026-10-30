// The command a kit surface binds to (audit §3.11). The registry that owns commands is
// the host's (khaos-app A-Q1); the kit takes them as props and asks the host to run one
// by id. Toolbar, CommandPalette and Menu draw the same shape.

/**
 * @typedef {Object} Command
 * @property {string} id The command's stable id; also its `data-command`.
 * @property {string} label What the command says, in a button or the palette.
 * @property {string} [group] The palette group (which menu it lives in).
 * @property {string} [shortcut] Display text for its key equivalent, such as `⌘K`.
 * @property {string} [icon] Phosphor icon name, for a toolbar button.
 * @property {string} [disabledReason] Present exactly when the command cannot run, in the host's (engine's) words.
 */



/**
 * The commands whose group or label contains `query` (case-insensitive). A disabled
 * command stays listed: the palette shows its reason rather than hiding it (audit §3.11).
 * Carried from the khaos-app prototype's `commands.ts`.
 *
 * @param {readonly Command[]} commands
 * @param {string} query
 * @returns {Command[]}
 */
export function matchCommands(commands, query) {
  const q = query.trim().toLowerCase()
  return commands.filter((c) => !q || `${c.group ?? ''} ${c.label}`.toLowerCase().includes(q))
}
