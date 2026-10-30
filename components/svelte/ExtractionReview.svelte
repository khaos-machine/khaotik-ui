<script>
  // One model-proposed record under review (RFC 0089), built to Khaos App's
  // docs/design/review-surface-217.md §4-§7. What the record offers for the person's choice so far,
  // and the decision each verdict sends, are the host's: `answers` and `decisionsFor` carry them,
  // and `ondecide` and `oncreate` report them back unchanged. Moved from Khaos App (catalog
  // app-coverage plan, T6).
  import { tick } from 'svelte'
  import Button from './Button.svelte'
  import ConfirmDialog from './ConfirmDialog.svelte'
  import EditableField from './EditableField.svelte'
  import Menu from './Menu.svelte'
  import SectionHeader from './SectionHeader.svelte'
  import SelectableRow from './SelectableRow.svelte'
  import Toggle from './Toggle.svelte'
  import { characterNamed, endpointName, namesACharacter, referentChoices, referentKindCopy, reviewPhrase, reviewTitle } from './lib/review.js'

  /** @typedef {import('./lib/review.js').ReviewItem} ReviewItem */
  /** @typedef {import('./lib/review.js').VerdictButton} VerdictButton */

  /**
   * @typedef {Object} Props
   * @property {ReviewItem | null} [item] The record under review.
   * @property {import('./lib/review.js').ReviewStory} [story] The identities the story holds.
   * @property {(sceneId: string) => number | null} [sceneNumber] A scene's 1-based number, or null when the host does not hold it. Never invented.
   * @property {readonly { value: string, label: string, group?: string }[] | undefined} [roster] The Character menu's items, grouped as the roster groups them. Defaults to the story's characters, ungrouped.
   * @property {boolean} [busy] A decision is being sent: every control waits.
   * @property {readonly import('./lib/review.js').Answer[]} [answers] The single-choice answers the record asks for.
   * @property {(choice: import('./lib/review.js').ReviewChoice) => import('./lib/review.js').Decisions | null} [decisionsFor] What the record offers for the choice so far: the host's.
   * @property {(decision: unknown, phrase: string, boundAs: string, always: import('./lib/review.js').AlwaysMatch | null) => Promise<boolean>} [ondecide] Sends a verdict's decision; resolves true once the engine recorded it.
   * @property {(item: ReviewItem, name: string, options: { always: boolean, identityKind: 'individual' | 'group' }) => Promise<boolean>} [oncreate] Creates the identity and binds the record; resolves true once the engine recorded it.
   */

  /** @type {Props} */
  let {
    item = null,
    story = { characters: [], objects: [], groups: [], locations: [] },
    sceneNumber = () => null,
    roster = undefined,
    busy = false,
    answers = [],
    decisionsFor = () => null,
    ondecide = async () => false,
    oncreate = async () => false,
  } = $props()

  /** @type {string | null} */
  let answer = $state(null)
  // The menu pick; until the person picks, the character the mention's name already names.
  /** @type {string | null} */
  let picked = $state(null)
  // "Always match": off for every record, since the host keys the pane on the record. One goes
  // with Bind, the other with "Create and bind", so each reads as part of the action it applies to.
  let always = $state(false)
  let alwaysCreate = $state(false)

  // The character the mention's name already names, if any: preselected, and never created again.
  const holder = $derived(item?.kind === 'reference' && namesACharacter(item) ? characterNamed(item.record.name, story.characters) : null)
  const pick = $derived(picked ?? holder?.id ?? null)
  const uid = $props.id()
  const hintId = `${uid}-hint`

  const characterName = (/** @type {string} */ id) => story.characters.find((c) => c.id === id)?.name ?? id
  const phrase = $derived(item ? reviewPhrase(item) : '')
  // A relation's endpoints: the chosen identity, or the candidates still open (RFC 0080 §2).
  const endpoints = $derived.by(() => {
    if (item?.kind !== 'relation') return []
    const r = item.record
    const side = (/** @type {string} */ label, /** @type {string} */ quoted, /** @type {string | undefined} */ id, /** @type {readonly string[]} */ candidates) => ({
      label: `${label} “${quoted}”`,
      value: id
        ? endpointName(story, id)
        : candidates.length
          ? `not settled — ${candidates.map((c) => endpointName(story, c)).join(' or ')}`
          : 'not settled',
    })
    return [side('From', r.fromPhrase, r.fromId, r.candidateFromIds), side('To', r.toPhrase, r.toId, r.candidateToIds)]
  })
  const scene = $derived(item ? sceneNumber(item.record.sceneId) : null)
  const eyebrow = $derived.by(() => {
    if (!item) return ''
    if (item.kind === 'relation') return 'relationship · in the text'
    if (item.kind === 'reference') {
      return item.record.speakerCharacterId ? `mentioned by ${characterName(item.record.speakerCharacterId)}` : 'mentioned in the action'
    }
    return `${item.kind === 'entityAppearance' ? 'character' : item.kind === 'objectAppearance' ? 'object' : 'place'} · in the action`
  })
  const question = $derived(
    !item
      ? ''
      : item.kind === 'entityAppearance'
        ? 'Who is it?'
        : item.kind === 'objectAppearance'
          ? 'Which object is it?'
          : item.kind === 'locationAppearance'
            ? 'Which place is it?'
            : item.kind === 'relation'
              ? ''
              : referentKindCopy(item.record.referentKind).question,
  )
  const decisions = $derived(item ? decisionsFor({ answer, pick }) : null)
  // An object or a place in the action answered "Something already in the story" picks any one.
  const anyIdentity = $derived(answer === 'existing' && (item?.kind === 'objectAppearance' || item?.kind === 'locationAppearance'))
  const menuItems = $derived.by(() => {
    if (!item) return []
    if (item.kind === 'reference') return referentChoices(item.record, story)
    if (anyIdentity) return (item.kind === 'objectAppearance' ? story.objects : story.locations).map((n) => ({ value: n.id, label: n.name }))
    if (item.kind === 'objectAppearance') return story.groups.map((g) => ({ value: g.id, label: g.name }))
    return roster ? [...roster] : story.characters.map((c) => ({ value: c.id, label: c.name }))
  })
  const showMenu = $derived(
    !!item &&
      ((item.kind === 'entityAppearance' && answer === 'existing') ||
        anyIdentity ||
        (item.kind === 'objectAppearance' && (answer === 'member' || answer === 'group')) ||
        (item.kind === 'reference' && decisions?.kind === 'decidable' && decisions.buttons.some((b) => b.verdict === 'bound'))),
  )
  // "Create and bind" (RFC 0098, RFC 0101): the primary action wherever the record offers a
  // create. The name starts as the record's own and is the person's to edit; null until edited.
  const create = $derived(decisions?.create ?? null)
  const creates = $derived(create !== null)
  /** @type {string | null} */
  let edited = $state(null)
  const newName = $derived(edited ?? create?.name ?? '')
  // A mentioned object asks one thing or a group; an appearance's answer already said which.
  let createGroup = $state(false)
  const identityKind = $derived(create?.identityKind ?? (createGroup ? 'group' : 'individual'))
  const createNoun = $derived(create?.kind === 'object' ? 'object' : create?.kind === 'location' ? 'place' : 'character')
  let confirmingCreate = $state(false)
  // Offered with Bind where the review asks which existing character it is.
  const alwaysOffered = $derived(!!item && namesACharacter(item) && showMenu)
  const alwaysName = $derived(item && (item.kind === 'entityAppearance' || item.kind === 'reference') ? item.record.name : '')
  const alwaysLabel = $derived(
    pick ? `Always match “${alwaysName}” to ${characterName(pick)}` : `Always match “${alwaysName}” to this character`,
  )
  const menuLabel = $derived(
    item?.kind === 'reference'
      ? referentKindCopy(item.record.referentKind).label
      : anyIdentity
        ? item?.kind === 'objectAppearance' ? 'Object' : 'Place'
        : item?.kind === 'objectAppearance' ? 'Group' : 'Character',
  )

  /** How a binding reads in the success line: "as a new object", "to STEEL". */
  function boundAs() {
    if (!item) return ''
    const named = answers.find((a) => a.key === answer)
    if (item.kind === 'entityAppearance') return answer === 'new' ? 'as a new character' : pick ? `to ${characterName(pick)}` : ''
    if (item.kind === 'reference') return pick ? `to ${menuItems.find((m) => m.value === pick)?.label ?? pick}` : ''
    if (!named) return ''
    return named.title.startsWith('Same as ') ? `to ${named.title.slice('Same as '.length)}` : `as ${named.title.charAt(0).toLowerCase()}${named.title.slice(1)}`
  }

  /** @param {VerdictButton} button */
  async function send(button) {
    if (!button.decision || busy) return
    // The host sends the alias only after a bind the engine recorded.
    const characterId = alwaysOffered && always ? pick : null
    const decided = await ondecide(
      button.decision,
      phrase,
      button.verdict === 'bound' ? boundAs() : '',
      characterId ? { characterId, characterName: characterName(characterId), alias: alwaysName } : null,
    )
    if (decided) await focusNext()
  }

  async function createAndBind() {
    confirmingCreate = false
    if (!item || !creates || busy) return
    if (await oncreate(item, newName, { always: alwaysCreate, identityKind })) await focusNext()
  }

  async function focusNext() {
    // Focus follows the queue: the next record's title, or the empty state's.
    await tick()
    /** @type {HTMLElement | null} */
    const target = document.querySelector('[data-review-title] h2, [data-review-empty] h2, [data-review-empty] h3')
    if (target) {
      target.tabIndex = -1
      target.focus()
    }
  }
</script>

{#if item}
  <div data-review-title>
    <SectionHeader title={reviewTitle(item)} {eyebrow} />
  </div>
  {#if item.kind === 'relation'}
    <p class="ui-review__meta">{scene !== null ? `Scene S${scene}` : 'Scene unknown'}</p>
    <ul class="ui-review__list" aria-label="Quoted in the screenplay">
      {#each item.record.spans as span, i (i)}
        <li>
          <span class="ui-review__meta">line {span.lineNumber} · “{span.sourcePhrase}”</span>
        </li>
      {/each}
    </ul>
    <ul class="ui-review__list" aria-label="Endpoints">
      {#each endpoints as end (end.label)}
        <li><span class="ui-review__meta">{end.label}:</span> {end.value}</li>
      {/each}
    </ul>
  {:else}
    <p class="ui-review__meta">{scene !== null ? `Scene S${scene} · ` : ''}line {item.record.lineNumber}</p>
  {/if}

  {#if decisions}
    {#if creates}
      <!-- The primary path for a person only talked about (RFC 0098): mint them, then bind this
           mention. The confirmation names the identity and the line. -->
      <div class="ui-review__create" role="group" aria-label={`Create a new ${createNoun}`}>
        <SectionHeader title={`Create a new ${createNoun}`} />
        <EditableField label="Name" placeholder={`The ${createNoun}'s name`} value={newName} onsave={(/** @type {string} */ value) => (edited = value)} />
        {#if create?.kind === 'object' && create.identityKind === null}
          <div class="ui-review__choices">
            <SelectableRow title="A new object" subtitle="one thing" selected={!createGroup} onclick={() => (createGroup = false)} />
            <SelectableRow title="A new group of objects" subtitle="several of the same thing" selected={createGroup} onclick={() => (createGroup = true)} />
          </div>
        {/if}
        {#if create?.kind === 'character'}
          <Toggle
            label={`Always match “${alwaysName}” to the new character`}
            hint={`Makes “${alwaysName}” an alias. Its other pending mentions are matched now, and new ones automatically.`}
            checked={alwaysCreate}
            disabled={busy}
            onchange={(/** @type {boolean} */ on) => (alwaysCreate = on)} />
        {/if}
        <div class="ui-review__create-action">
          <Button variant="primary" disabled={busy || !newName.trim()} onclick={() => (confirmingCreate = true)}>Create and bind</Button>
        </div>
      </div>
    {/if}
    {#if answers.length || showMenu}
      <SectionHeader title={question} />
    {/if}
    {#if answers.length}
      <div class="ui-review__choices" role="group" aria-label={question}>
        {#each answers as a (a.key)}
          <SelectableRow
            title={a.title}
            subtitle={a.subtitle}
            selected={answer === a.key}
            onclick={() => {
              if (busy) return
              answer = answer === a.key ? null : a.key
            }} />
        {/each}
      </div>
    {/if}
    {#if showMenu}
      <div class="ui-review__menu">
        <Menu
          label={menuLabel}
          value={pick ?? ''}
          items={menuItems}
          currentLabel="Choose…"
          disabled={busy}
          onselect={(/** @type {string} */ value) => (picked = value)} />
      </div>
    {/if}
    <div class="ui-review__verdicts" role="group" aria-label={`Decide “${phrase}”`} aria-describedby={hintId}>
      {#if alwaysOffered}
        <div class="ui-review__always">
          <Toggle
            label={alwaysLabel}
            hint={`Makes “${alwaysName}” an alias. Its other pending mentions are matched now, and new ones automatically.`}
            checked={always}
            disabled={busy}
            onchange={(/** @type {boolean} */ on) => (always = on)} />
        </div>
      {/if}
      {#each decisions.buttons as b (b.label)}
        <Button
          variant={b.primary && !creates ? 'primary' : 'secondary'}
          disabled={busy || !b.decision}
          describedby={hintId}
          onclick={() => void send(b)}>{b.label}</Button>
      {/each}
    </div>
    <p class="ui-review__meta" id={hintId}>{decisions.hint}</p>
  {/if}

  {#if confirmingCreate && create}
    {@const where = `(${scene !== null ? `Scene S${scene}, ` : ''}line ${item.record.lineNumber})`}
    {@const name = newName.trim()}
    <ConfirmDialog
      open
      target={`${name} to the story`}
      action="Add"
      tone="default"
      confirmLabel="Create and bind"
      description={create.kind === 'character'
        ? `Add ${name} to the story as a character who is talked about but appears in no scene, and bind this mention ${where} to them.${alwaysCreate ? ` Other pending mentions of “${alwaysName}” will be matched too.` : ''}`
        : `Add ${name} to the story as ${create.kind === 'location' ? 'a place' : identityKind === 'group' ? 'a group of objects' : 'an object'}, and bind ${item.kind === 'reference' ? 'this mention' : 'this'} ${where} to it.${create.sameName ? ` There is already an object named ${create.sameName.name}; choose it from the menu if it is the same one.` : ''}`}
      onConfirm={() => void createAndBind()}
      onCancel={() => (confirmingCreate = false)}
      onOpenChange={(/** @type {boolean} */ open) => (confirmingCreate = open)} />
  {/if}
{/if}

<style>
  .ui-review__meta {
    margin: var(--spacing-2xs) 0 var(--spacing-sm);
    font-size: var(--body-md-size);
    color: var(--text-secondary);
  }

  .ui-review__list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    margin: var(--spacing-sm) 0;
    padding: 0;
    list-style: none;
  }

  .ui-review__list .ui-review__meta {
    display: block;
    margin: 0;
  }

  .ui-review__choices {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xs);
    margin-bottom: var(--spacing-md);
  }

  .ui-review__menu {
    margin-bottom: var(--spacing-md);
  }

  /* Inside the verdict row, on a line of its own above the buttons it applies to. */
  .ui-review__always {
    flex-basis: 100%;
  }

  .ui-review__create {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  .ui-review__create-action {
    display: flex;
  }

  .ui-review__verdicts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
  }
</style>
