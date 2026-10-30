import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import TakeList from '@khaos-machine/khaotik-ui/components/svelte/TakeList.svelte'
// Static, as every other catalog test imports it: a dynamic import put the
// whole catalog's load under the 10s test timeout, and a busy runner crossed it.
import { fixtures } from '../fixtures.js'

// #216 (khaos-app#185, slice U1): a pure view of one dialogue line's takes.
// Props in, callbacks out. The app owns every decision — which take is chosen,
// whether a delete is confirmed — and the kit only draws the engine's answer and
// reports what the user asked for.

const takes = [
  { id: 'take_a', label: 'Take 1', createdAt: '2026-09-28T21:04:11Z', voiceName: 'Kiki (KittenTTS)', src: 'blob:take-a' },
  { id: 'take_b', label: 'Take 2', createdAt: '2026-09-28T21:06:40Z', voiceName: 'Kiki (KittenTTS)', src: 'blob:take-b' },
  { id: 'take_c', label: 'Take 3', createdAt: '2026-09-28T21:09:02Z', voiceName: 'Kiki (KittenTTS)', src: 'blob:take-c' },
]

const rows = () => screen.getAllByRole('listitem')

describe('TakeList marks exactly the chosen take', () => {
  it('draws one Chosen badge, on the chosenId row, and no "Use this take" there', () => {
    render(TakeList, { props: { takes, chosenId: 'take_b', onChoose: () => {} } })

    expect(rows()).toHaveLength(3)
    expect(screen.getAllByText('Chosen')).toHaveLength(1)
    expect(within(rows()[1]).getByText('Chosen')).toBeInTheDocument()
    expect(within(rows()[1]).queryByRole('button', { name: /Use this take/ })).toBeNull()
    // Positive control: the other rows DO carry the action, so the absence
    // above is the chosen row's rule and not a query that finds nothing.
    expect(within(rows()[0]).getByRole('button', { name: /Use this take/ })).toBeInTheDocument()
    expect(within(rows()[2]).getByRole('button', { name: /Use this take/ })).toBeInTheDocument()
  })

  it('draws no badge when chosenId is absent', () => {
    render(TakeList, { props: { takes, onChoose: () => {} } })

    expect(rows()).toHaveLength(3)
    expect(screen.queryByText('Chosen')).toBeNull()
    expect(screen.getAllByRole('button', { name: /Use this take/ })).toHaveLength(3)
  })
})

describe('TakeList reports a delete and confirms nothing itself', () => {
  it('calls onDelete(id) once and opens no dialog', async () => {
    const onDelete = vi.fn()
    render(TakeList, { props: { takes, chosenId: 'take_b', onDelete } })

    await fireEvent.click(within(rows()[2]).getByRole('button', { name: /Delete/ }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('take_c')
    // The app owns the confirmation (architecture frame, amendment 1 §E).
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })
})

describe('TakeList reports choosing and generating, and changes nothing itself', () => {
  it('calls onChoose(id) with the row\'s take, and moves no badge', async () => {
    const onChoose = vi.fn()
    render(TakeList, { props: { takes, chosenId: 'take_b', onChoose } })

    await fireEvent.click(within(rows()[0]).getByRole('button', { name: /Use this take/ }))

    expect(onChoose).toHaveBeenCalledTimes(1)
    expect(onChoose).toHaveBeenCalledWith('take_a')
    // Not optimistic: the app re-reads the engine and passes the answer back.
    expect(within(rows()[1]).getByText('Chosen')).toBeInTheDocument()
    expect(within(rows()[0]).queryByText('Chosen')).toBeNull()
  })

  it('calls onGenerate once when Generate is pressed', async () => {
    const onGenerate = vi.fn()
    render(TakeList, { props: { takes, onGenerate } })

    const generate = screen.getByRole('button', { name: /Generate take/ })
    expect(generate).toBeEnabled()
    await fireEvent.click(generate)

    expect(onGenerate).toHaveBeenCalledTimes(1)
  })
})

describe('TakeList: generating and both disabledReason states disable Generate, visibly and audibly', () => {
  it('generating: Generate is disabled, says so, and a click reaches no handler', async () => {
    const onGenerate = vi.fn()
    render(TakeList, { props: { takes, generating: true, onGenerate } })

    const generate = screen.getByRole('button', { name: /Generating…/ })
    expect(generate).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Generating a take…')
    // Through aria-describedby: this state sets no title, which would otherwise
    // stand in as the description and hide a broken reference.
    expect(generate).toHaveAccessibleDescription('Generating a take…')
    // D68: jsdom delivers a click to a disabled button's onclick, so the gate
    // must hold inside the handler too.
    await fireEvent.click(generate)
    expect(onGenerate).not.toHaveBeenCalled()
  })

  it('uncast: the engine\'s reason is shown verbatim, announced, and describes Generate', async () => {
    const onGenerate = vi.fn()
    const reason = 'element elem_01KJXTKAMJ5J0KH5TS267M8C0G: character chr_01KJXTKAMJD3ZA246EGWM62G38 has no cast voice'
    render(TakeList, { props: { takes, disabledReason: reason, onGenerate, onChoose: () => {}, onDelete: () => {} } })

    const generate = screen.getByRole('button', { name: /Generate take/ })
    expect(generate).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(reason)
    expect(generate).toHaveAccessibleDescription(reason)
    await fireEvent.click(generate)
    expect(onGenerate).not.toHaveBeenCalled()
    // Only generating is blocked: the existing takes stay playable, choosable
    // and deletable.
    expect(rows()).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /Use this take/ })).toHaveLength(3)
    expect(screen.getAllByRole('button', { name: /Delete/ })).toHaveLength(3)
  })

  it('package can\'t hold takes: the reason with no takes, and no "No takes yet" beside it', () => {
    // KSPD's refusal for a pre-v3 ledger, as its error chain renders it.
    const reason = 'kspd: document does not conform: story transaction needs a v3 ledger'
    render(TakeList, { props: { takes: [], disabledReason: reason, onGenerate: () => {} } })

    expect(screen.getByRole('button', { name: /Generate take/ })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(reason)
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.queryByText('No takes yet.')).toBeNull()
  })

  it('a blank or whitespace-only reason is no reason', () => {
    render(TakeList, { props: { takes: [], disabledReason: '   ', onGenerate: () => {} } })

    expect(screen.getByRole('button', { name: /Generate take/ })).toBeEnabled()
    expect(screen.getByText('No takes yet.')).toBeInTheDocument()
  })

  it('keeps the live region mounted with nothing to say, so a later reason is announced', () => {
    render(TakeList, { props: { takes, onGenerate: () => {} } })

    // Exact, not toHaveTextContent(''), which matches any text at all.
    expect(screen.getByRole('status').textContent).toBe('')
  })
})

describe('TakeList: the empty, one and many states', () => {
  it('empty: says so, with Generate live', () => {
    render(TakeList, { props: { takes: [], onGenerate: () => {} } })

    expect(screen.getByText('No takes yet.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).toBeNull()
    expect(screen.getByRole('button', { name: /Generate take/ })).toBeEnabled()
  })

  it('one take: its label, voice and a player named for it', () => {
    render(TakeList, { props: { takes: [takes[0]] } })

    expect(rows()).toHaveLength(1)
    expect(within(rows()[0]).getByText('Take 1')).toBeInTheDocument()
    expect(within(rows()[0]).getByText(/Kiki \(KittenTTS\)/)).toBeInTheDocument()
    expect(within(rows()[0]).getByRole('button', { name: 'Play Take 1' })).toBeInTheDocument()
    expect(screen.queryByText('No takes yet.')).toBeNull()
  })

  it('many takes: one row each, in the order given', () => {
    render(TakeList, { props: { takes } })

    expect(rows().map((r) => within(r).getByText(/^Take \d$/).textContent)).toEqual(['Take 1', 'Take 2', 'Take 3'])
  })

  it('marks up when each take was recorded, and shows an unparseable time as given', () => {
    render(TakeList, { props: { takes: [takes[0], { ...takes[1], createdAt: 'yesterday-ish' }] } })

    expect(rows()[0].querySelector('time')).toHaveAttribute('datetime', '2026-09-28T21:04:11Z')
    expect(within(rows()[1]).getByText('yesterday-ish')).toBeInTheDocument()
  })

  it('treats an empty chosenId as none chosen, even against an empty take id', () => {
    // A Go producer sends "" for an absent field; "" must not match "".
    render(TakeList, { props: { takes: [{ ...takes[0], id: '' }], chosenId: '' } })

    expect(screen.queryByText('Chosen')).toBeNull()
  })
})

describe('TakeList shows a row\'s engine error verbatim, in place of its player', () => {
  const message = 'kspd: story data differs from committed snapshot'

  it('renders the message on that row and no player there', () => {
    render(TakeList, { props: { takes: [takes[0], { ...takes[1], error: message }] } })

    expect(within(rows()[1]).getByText(message)).toBeInTheDocument()
    expect(within(rows()[1]).queryByRole('button', { name: /Play/ })).toBeNull()
    // Positive control: the healthy row keeps its player.
    expect(within(rows()[0]).getByRole('button', { name: 'Play Take 1' })).toBeInTheDocument()
    expect(within(rows()[0]).queryByText(message)).toBeNull()
  })

  it('renders an Error by its message, and a blank error as no error', () => {
    render(TakeList, {
      props: { takes: [{ ...takes[0], error: new Error(message) }, { ...takes[1], error: '  ' }] },
    })

    expect(within(rows()[0]).getByText(message)).toBeInTheDocument()
    expect(within(rows()[1]).getByRole('button', { name: 'Play Take 2' })).toBeInTheDocument()
  })
})

// The library's rule for a missing handler (Launcher, #211):
// a primary affordance dims, a destructive verb hides.
describe('TakeList with a handler missing', () => {
  it('dims Generate without onGenerate, and says why', () => {
    render(TakeList, { props: { takes } })

    const generate = screen.getByRole('button', { name: /Generate take/ })
    expect(generate).toBeDisabled()
    expect(generate).toHaveAttribute('title', 'Not available in this app')
  })

  it('offers no "Use this take" without onChoose (D80): a dimmed one per row reads as broken', () => {
    render(TakeList, { props: { takes } })

    expect(screen.queryByRole('button', { name: /Use this take/ })).toBeNull()
  })

  it('hides Delete without onDelete', () => {
    render(TakeList, { props: { takes } })

    expect(screen.queryByRole('button', { name: /Delete/ })).toBeNull()
  })

  it('enables each action once its handler is supplied', () => {
    render(TakeList, { props: { takes, onGenerate: () => {}, onChoose: () => {}, onDelete: () => {} } })

    expect(screen.getByRole('button', { name: /Generate take/ })).toBeEnabled()
    for (const button of screen.getAllByRole('button', { name: /Use this take/ })) expect(button).toBeEnabled()
    for (const button of screen.getAllByRole('button', { name: /Delete/ })) expect(button).toBeEnabled()
  })
})

// Review of #217 (verdict 5346850132): behaviours claimed or frame-required that
// no test pinned. Each block names the mutant it exists to kill.
describe('TakeList review pins', () => {
  const reason = 'element elem_01KJXTKAMJ5J0KH5TS267M8C0G: character chr_01KJXTKAMJD3ZA246EGWM62G38 has no cast voice'

  it('S5: with generating and a reason together, the reason wins in the status AND the label', () => {
    render(TakeList, { props: { takes, generating: true, disabledReason: reason, onGenerate: () => {} } })

    expect(screen.getByRole('status').textContent).toBe(reason)
    // The label must not say "Generating…" beside a reason saying generation is
    // impossible: it follows the reason that won.
    const generate = screen.getByRole('button', { name: 'Generate take' })
    expect(generate).toBeDisabled()
    expect(screen.queryByRole('button', { name: /Generating/ })).toBeNull()
  })
  it('S1: the live region is the same node across prop changes, holding the new text', async () => {
    const { rerender } = render(TakeList, { props: { takes, onGenerate: () => {} } })
    const region = screen.getByRole('status')

    await rerender({ takes, onGenerate: () => {}, generating: true })
    expect(screen.getByRole('status')).toBe(region)
    expect(region.textContent).toBe('Generating a take…')

    await rerender({ takes, onGenerate: () => {}, generating: true, disabledReason: reason })
    expect(screen.getByRole('status')).toBe(region)
    expect(region.textContent).toBe(reason)
  })

  it('S2: the chosen row keeps Delete, and it reports the chosen id once', async () => {
    const onDelete = vi.fn()
    render(TakeList, { props: { takes, chosenId: 'take_b', onDelete } })

    await fireEvent.click(within(rows()[1]).getByRole('button', { name: 'Delete Take 2' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith('take_b')
  })

  it('S3/S4: Use and Delete are named for their own take, exactly', () => {
    render(TakeList, { props: { takes, onChoose: () => {}, onDelete: () => {} } })

    takes.forEach((take, i) => {
      expect(within(rows()[i]).getByRole('button', { name: `Use this take: ${take.label}` })).toBeInTheDocument()
      expect(within(rows()[i]).getByRole('button', { name: `Delete ${take.label}` })).toBeInTheDocument()
    })
  })

  it('S6/S7: an errored row keeps Use and Delete; the engine answers any write', () => {
    const errored = [takes[0], { ...takes[1], error: 'kspd: story data differs from committed snapshot' }]
    render(TakeList, { props: { takes: errored, onChoose: () => {}, onDelete: () => {} } })

    expect(within(rows()[1]).getByRole('button', { name: 'Use this take: Take 2' })).toBeEnabled()
    expect(within(rows()[1]).getByRole('button', { name: 'Delete Take 2' })).toBeEnabled()
  })

  it('S9: Generate carries the reason as its title', () => {
    render(TakeList, { props: { takes, disabledReason: reason, onGenerate: () => {} } })

    expect(screen.getByRole('button', { name: 'Generate take' })).toHaveAttribute('title', reason)
  })

  it('S10: a parseable createdAt is formatted in the reader\'s locale, not shown raw', () => {
    render(TakeList, { props: { takes: [takes[0]] } })

    const expected = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(takes[0].createdAt))
    const time = rows()[0].querySelector('time')
    expect(time.textContent).toBe(expected)
    expect(time.textContent).not.toBe(takes[0].createdAt)
  })
})

// #217 review F3: the catalog's illustrative takes carry the engine's shape —
// `take_` + a ULID whose time part is the take's createdAt (plan K4), listed
// newest first (M1's ListTakes). The fixture comment says so; this holds it to it.
describe('TakeList catalog fixture is in the engine\'s shape', () => {
  const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  const ulidTime = (ulid) => new Date(Number([...ulid.slice(0, 10)].reduce((n, c) => n * 32n + BigInt(CROCKFORD.indexOf(c)), 0n)))

  it('every example lists ULID-shaped ids, each dated by its own createdAt, newest first', () => {
    const entry = fixtures.find((f) => f.name === 'TakeList')
    const listings = entry.examples.map((e) => e.props.takes).filter((t) => t.length)

    expect(listings.length).toBeGreaterThan(0)
    for (const listing of listings) {
      for (const take of listing) {
        expect(take.id).toMatch(/^take_[0-9A-HJKMNP-TV-Z]{26}$/)
        expect(ulidTime(take.id.slice(5)).toISOString()).toBe(new Date(take.createdAt).toISOString())
      }
      const times = listing.map((t) => Date.parse(t.createdAt))
      expect(times).toEqual([...times].sort((a, b) => b - a))
    }
  })
})

describe('TakeList with a direction (D80)', () => {
  it('sends the typed direction with Generate, and Enter generates', async () => {
    const onGenerate = vi.fn()
    render(TakeList, { props: { takes: [], onGenerate, directionLabel: 'Direction' } })
    await fireEvent.input(screen.getByLabelText('Direction'), { target: { value: '  quiet, furious ' } })
    await fireEvent.click(screen.getByRole('button', { name: /Generate take/ }))
    expect(onGenerate).toHaveBeenCalledWith('quiet, furious')
    await fireEvent.keyDown(screen.getByLabelText('Direction'), { key: 'Enter' })
    expect(onGenerate).toHaveBeenCalledTimes(2)
  })

  it('draws no field without a label, and names Generate as the host asks', async () => {
    const onGenerate = vi.fn()
    render(TakeList, { props: { takes: [], onGenerate, generateLabel: 'Read scene' } })
    expect(screen.queryByLabelText('Direction')).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: /Read scene/ }))
    expect(onGenerate).toHaveBeenCalledWith('')
  })
})

describe('TakeList Try again (D85)', () => {
  const failed = [
    { id: 'ok', label: 'Take 2', createdAt: '2026-09-30T20:00:00Z', voiceName: 'v', src: 'blob:2' },
    { id: 'bad', label: 'Take 1', createdAt: '2026-09-30T19:59:00Z', voiceName: 'v', error: 'provider_rejected' },
  ]

  it('offers Try again only on a failed take, and reports which', async () => {
    const onRetry = vi.fn()
    render(TakeList, { props: { takes: failed, onRetry } })
    const buttons = screen.getAllByRole('button', { name: /^Try again/ })
    expect(buttons).toHaveLength(1)
    await fireEvent.click(buttons[0])
    expect(onRetry).toHaveBeenCalledWith('bad')
  })

  it('offers none without onRetry, and none while generating', () => {
    const { unmount } = render(TakeList, { props: { takes: failed } })
    expect(screen.queryByRole('button', { name: /^Try again/ })).toBeNull()
    unmount()
    render(TakeList, { props: { takes: failed, onRetry: () => {}, generating: true } })
    expect(screen.getByRole('button', { name: /^Try again/ })).toBeDisabled()
  })
})

describe('TakeList progress (D87)', () => {
  it("shows the host's progress while generating, and the plain line without it", () => {
    const { unmount } = render(TakeList, { props: { takes: [], generating: true, onGenerate: () => {}, progress: 'Sentence 2 of 3' } })
    expect(screen.getByRole('status').textContent).toBe('Sentence 2 of 3')
    unmount()
    render(TakeList, { props: { takes: [], generating: true, onGenerate: () => {} } })
    expect(screen.getByRole('status').textContent).toBe('Generating a take…')
  })
})

// #273: a take can be downloaded. The kit reports which take; the host owns the
// save dialog, the file write and the outcome, and says when one is in flight.
describe('TakeList reports a download and draws its busy state', () => {
  it('draws Download on every row only when onDownload is given', () => {
    const { unmount } = render(TakeList, { props: { takes, onDelete: () => {} } })
    expect(screen.queryByRole('button', { name: /Download/ })).toBeNull()
    // Positive control: the row's actions render, so the absence is the rule.
    expect(screen.getAllByRole('button', { name: /^Delete / })).toHaveLength(3)
    unmount()

    render(TakeList, { props: { takes, onDownload: () => {} } })
    expect(screen.getAllByRole('button', { name: /^Download Take \d$/ })).toHaveLength(3)
  })

  it('calls onDownload(id) with the row\'s take', async () => {
    const onDownload = vi.fn()
    render(TakeList, { props: { takes, onDownload } })

    await fireEvent.click(within(rows()[1]).getByRole('button', { name: 'Download Take 2' }))

    expect(onDownload).toHaveBeenCalledTimes(1)
    expect(onDownload).toHaveBeenCalledWith('take_b')
  })

  it('marks only the downloadingId row busy, and that row reports nothing more', async () => {
    const onDownload = vi.fn()
    render(TakeList, { props: { takes, onDownload, downloadingId: 'take_c' } })

    const busy = within(rows()[2]).getByRole('button', { name: 'Downloading Take 3' })
    expect(busy).toBeDisabled()
    expect(busy).toHaveAttribute('aria-busy', 'true')
    expect(busy).toHaveTextContent('Downloading…')
    // D68: jsdom delivers a click to a disabled button; the gate is restated.
    await fireEvent.click(busy)
    expect(onDownload).not.toHaveBeenCalled()

    const idle = within(rows()[0]).getByRole('button', { name: 'Download Take 1' })
    expect(idle).toBeEnabled()
    expect(idle).not.toHaveAttribute('aria-busy')
    await fireEvent.click(idle)
    expect(onDownload).toHaveBeenCalledWith('take_a')
  })

  it('offers no Download on a row with an error: it has no audio', () => {
    const failed = takes.map((t, i) => (i === 1 ? { ...t, src: '', error: 'kspd: story data conflict' } : t))
    render(TakeList, { props: { takes: failed, onDownload: () => {} } })

    expect(within(rows()[1]).queryByRole('button', { name: /Download/ })).toBeNull()
    expect(within(rows()[0]).getByRole('button', { name: 'Download Take 1' })).toBeInTheDocument()
  })
})

// Compact (data-layer Story fixes, the Line inspector): an inspector holds the list at its
// narrowest pane width, so every part wraps rather than scroll sideways, the Generate command
// is the kit's primary at the small size, and a take can carry the engine's "stale" state
// once a line's text can change (unused until the engine serves it; khaos-manager#689).
describe('TakeList, compact', () => {
  it('draws each take on one compact row with its time, and a stale take carries the mark', () => {
    const stale = [{ ...takes[0], state: 'stale' }, takes[1]]
    const { container } = render(TakeList, { props: { takes: stale, compact: true, onGenerate: () => {} } })
    expect(container.querySelector('.takes')).toHaveClass('takes--compact')
    expect(within(rows()[0]).getByText('Stale')).toBeInTheDocument()
    expect(within(rows()[1]).queryByText('Stale')).toBeNull()
    expect(within(rows()[0]).getByRole('button', { name: /Play Take 1/ })).toBeInTheDocument()
    expect(within(rows()[0]).getByText((_, el) => el?.tagName === 'TIME')).toBeInTheDocument()
  })

  it('keeps the Generate command the primary, at the small size', () => {
    render(TakeList, { props: { takes: [], compact: true, onGenerate: () => {} } })
    const generate = screen.getByRole('button', { name: /Generate take/ })
    expect(generate).toHaveClass('takes__btn--primary')
    expect(generate).toHaveClass('takes__btn--small')
  })

  it('without compact, a stale state still marks the take, and nothing else changes', () => {
    const { container } = render(TakeList, { props: { takes: [{ ...takes[0], state: 'stale' }] } })
    expect(container.querySelector('.takes')).not.toHaveClass('takes--compact')
    expect(screen.getByText('Stale')).toBeInTheDocument()
  })
})

// P1-U2: a take's peaks reach its player, and a host that can show a take in a timeline
// says so per row. Without onOpen there is no button (D80, as onChoose).
describe('TakeList with peaks and onOpen', () => {
  const peaks = { version: 2, channels: 1, sample_rate: 24000, samples_per_pixel: 240, bits: 8, length: 1, data: [-4, 9] }

  it("hands each row's peaks to its player", () => {
    const { container } = render(TakeList, { props: { takes: [{ ...takes[0], peaks }, takes[1]] } })
    const players = container.querySelectorAll('.takes__row')
    expect(players[0].querySelector('canvas')).not.toBeNull()
    expect(players[1].querySelector('canvas')).toBeNull()
  })

  it('offers "Open in timeline" named with the take, and reports its id', async () => {
    const onOpen = vi.fn()
    render(TakeList, { props: { takes, onOpen } })
    const open = screen.getByRole('button', { name: 'Open Take 2 in timeline' })
    expect(open.textContent).toContain('Open in timeline')
    await fireEvent.click(open)
    expect(onOpen).toHaveBeenCalledWith('take_b')
  })

  it('offers no "Open in timeline" without onOpen', () => {
    render(TakeList, { props: { takes } })
    expect(screen.queryByRole('button', { name: /in timeline/ })).toBeNull()
  })
})

// P1-U4: a take whose peaks failed is still a whole take. Its player stays, the message
// stands where the waveform would be, and the row offers no Try again — asking for the
// take again would hide a playable take and could bill for one that already exists.
describe('TakeList with peaksError on a row', () => {
  const message = 'scene take line 0 timing 0+0 ms does not follow the line before it'
  const withPeaksError = [{ ...takes[0], peaksError: message }, takes[1]]

  it('keeps the row playable and shows the message verbatim', () => {
    render(TakeList, { props: { takes: withPeaksError } })
    const row = rows()[0]
    expect(within(row).getByRole('button', { name: 'Play Take 1' })).toBeEnabled()
    expect(within(row).getByRole('slider', { name: 'Seek Take 1' })).toBeInTheDocument()
    expect(within(row).getByRole('status').textContent.trim()).toBe(message)
  })

  it('offers no Try again even when onRetry is given', () => {
    render(TakeList, { props: { takes: withPeaksError, onRetry: () => {}, onOpen: () => {} } })
    expect(screen.queryByRole('button', { name: /Try again/ })).toBeNull()
    // Positive control: the row's other actions still render, so the absence is the rule.
    expect(within(rows()[0]).getByRole('button', { name: 'Open Take 1 in timeline' })).toBeInTheDocument()
  })

  it('leaves the DOM unchanged without it', () => {
    // $props.id() counts up per mount, so the generated status id is normalised out.
    const html = (props) => {
      const out = render(TakeList, { props }).container.innerHTML.replace(/"c\d+(-direction)?"/g, '"ID$1"')
      document.body.innerHTML = ''
      return out
    }
    expect(html({ takes: takes.map((t) => ({ ...t, peaksError: '' })) })).toBe(html({ takes }))
  })
})
