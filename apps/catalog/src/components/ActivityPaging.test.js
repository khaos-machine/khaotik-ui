import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/svelte'
import Activity from '@khaos-machine/khaotik-ui/components/svelte/Activity.svelte'
import StoryAtlas from '@khaos-machine/khaotik-ui/components/svelte/StoryAtlas.svelte'
import { logEvents } from '@khaos-machine/khaotik-ui/components/svelte/lib/activity.js'

// khaotik-ui #40: a bounded Activity feed. The host pages and searches through khaosd
// (kspd-events); the kit draws the older-page action, the paging, search and refresh states,
// and counts from the totals the host passes, never from the rows it happens to hold.
// Rows are illustrative, in kspd-events' row shape (D62).

/** @param {number} n */
const rowsOf = (n) => Array.from({ length: n }, (_, i) => ({ seq: 100 - i, at: '2026-11-09T10:00:00Z', kind: `merge.row${i}`, actor: 'khaosd', changed: ['story'] }))
/** @param {number} n */
const daysOf = (n) => (n ? [{ key: '2026-11-09', title: 'Today', rows: rowsOf(n) }] : [])

/**
 * Each surface, rendered from one description: `rows` loaded, the feed state, the query and
 * the callbacks. `paged: false` passes no paging prop at all — the binder as khaos-app has it.
 */
const surfaces = [
  {
    name: 'the Activity window',
    mount: ({ state = { kind: 'loaded' }, rows = 2, feed, query = '', onQuery, onLoadOlder, onRefresh, paged = true }) => {
      const props = { state, projectTitle: 'B4P', total: 500, rowCount: rows, days: daysOf(rows), query, onQuery }
      render(Activity, { props: paged ? { ...props, feed: feed ?? {}, onLoadOlder, onRefresh } : props })
      return document.body
    },
  },
  {
    name: 'the Story Atlas activity panel',
    mount: ({ state = { kind: 'loaded' }, rows = 2, feed, query = '', onQuery, onLoadOlder, onRefresh, paged = true }) => {
      const props = { atlas: null, activityOpen: true, activity: state, events: logEvents(daysOf(rows), (at) => at) }
      render(StoryAtlas, {
        props: paged ? { ...props, activityFeed: feed ?? {}, activityQuery: query, onActivityQuery: onQuery, onActivityLoadOlder: onLoadOlder, onActivityRefresh: onRefresh } : props,
      })
      return screen.getByRole('complementary', { name: 'Story activity' })
    },
  },
]

describe.each(surfaces)('$name, paged', ({ mount }) => {
  it('reports Load older once per activation', async () => {
    const onLoadOlder = vi.fn()
    const at = within(mount({ feed: { hasMore: true, storyTotal: 500 }, onLoadOlder }))
    await fireEvent.click(at.getByRole('button', { name: 'Load older changes' }))
    expect(onLoadOlder).toHaveBeenCalledOnce()
  })

  it('ignores Load older while the older page is loading, and keeps the rows', async () => {
    const onLoadOlder = vi.fn()
    const at = within(mount({ feed: { hasMore: true, older: { kind: 'loading' } }, onLoadOlder }))
    const button = at.getByRole('button', { name: 'Loading older changes…' })
    expect(button.getAttribute('aria-disabled')).toBe('true')
    await fireEvent.click(button)
    expect(onLoadOlder).not.toHaveBeenCalled()
    expect(at.getByText('merge.row1')).toBeTruthy()
  })

  it('says an older page failed, keeps the rows and retries through Load older', async () => {
    const onLoadOlder = vi.fn()
    const at = within(mount({ feed: { hasMore: true, older: { kind: 'failed', message: 'khaosd is not running.' } }, onLoadOlder }))
    expect(at.getByRole('alert').textContent).toContain('khaosd is not running.')
    expect(at.getByText('merge.row0')).toBeTruthy()
    expect(at.getByText('merge.row1')).toBeTruthy()
    await fireEvent.click(at.getByRole('button', { name: 'Try loading older changes again' }))
    expect(onLoadOlder).toHaveBeenCalledOnce()
  })

  it('says a refresh failed, keeps the rows and retries through onRefresh', async () => {
    const onRefresh = vi.fn()
    const at = within(mount({ feed: { refresh: { kind: 'failed', message: 'The engine stopped.' } }, onRefresh }))
    expect(at.getByRole('alert').textContent).toContain('The engine stopped.')
    expect(at.getByText('merge.row1')).toBeTruthy()
    await fireEvent.click(at.getByRole('button', { name: 'Check for newer changes again' }))
    expect(onRefresh).toHaveBeenCalledOnce()
  })

  it('says newer changes are still being read while a refresh has a backlog', () => {
    const at = within(mount({ feed: { refresh: { kind: 'catching-up' } } }))
    expect(at.getByText('Reading newer changes…')).toBeTruthy()
    expect(at.getByText('merge.row1')).toBeTruthy()
  })

  it('offers no Load older when has_more is false', () => {
    const at = within(mount({ feed: { hasMore: false, storyTotal: 2 }, onLoadOlder: vi.fn() }))
    expect(at.queryByRole('button', { name: /older/ })).toBeNull()
  })

  it('says a search is running, with the query still in its field', () => {
    const at = within(mount({ rows: 0, query: 'decision', feed: { search: { kind: 'searching' } }, onQuery: vi.fn() }))
    expect(at.getByText('Searching the whole history…')).toBeTruthy()
    expect(at.getByRole('searchbox', { name: 'Search changes' }).value).toBe('decision')
  })

  it('says a search matched nothing, and the query can still be cleared', async () => {
    const onQuery = vi.fn()
    const at = within(mount({ rows: 0, query: 'zzz', feed: { matchedTotal: 0, storyTotal: 500 }, onQuery }))
    expect(at.getByText('No changes match that search.')).toBeTruthy()
    await fireEvent.click(at.getByRole('button', { name: 'Clear search changes' }))
    expect(onQuery).toHaveBeenCalledWith('')
  })

  it('distinguishes a khaosd that cannot search from a search that failed', () => {
    const first = within(mount({ rows: 0, query: 'x', feed: { search: { kind: 'unsupported' } }, onQuery: vi.fn() }))
    expect(first.getByText(/This khaosd cannot search the story’s history/)).toBeTruthy()
    document.body.innerHTML = ''
    const second = within(mount({ rows: 0, query: 'x', feed: { search: { kind: 'failed', message: 'Bad query.' } }, onQuery: vi.fn() }))
    expect(second.getByRole('alert').textContent).toContain('Bad query.')
  })

  it('counts from the totals given, not from the rows loaded', () => {
    const story = within(mount({ rows: 2, feed: { storyTotal: 500, hasMore: true } }))
    expect(story.getByText('Showing 2 of 500 changes')).toBeTruthy()
    document.body.innerHTML = ''
    const matched = within(mount({ rows: 2, query: 'merge', feed: { matchedTotal: 57, storyTotal: 500, hasMore: true }, onQuery: vi.fn() }))
    expect(matched.getByText('Showing 2 of 57 matching changes')).toBeTruthy()
  })
})

// khaotik-ui #46: a khaosd with no story-activity-query can't read the history page by page,
// with or without a query. A top-level `unsupported` state says so; before it, an unfiltered
// feed could only draw "No committed changes" (false) or the generic read failure.
describe.each(surfaces)('$name, a khaosd that cannot page the history', ({ mount }) => {
  it('draws the unsupported state for an unfiltered feed, not an empty story or a failure', () => {
    const at = within(mount({ state: { kind: 'unsupported' }, rows: 0, onQuery: vi.fn() }))
    expect(at.getByText('This khaosd cannot read the story’s history')).toBeTruthy()
    expect(at.getByText(/Update khaosd/)).toBeTruthy()
    expect(at.queryByText('No committed changes')).toBeNull()
    expect(at.queryByText('Could not read the activity')).toBeNull()
    expect(at.queryByRole('alert')).toBeNull()
  })

  it('keeps the search sub-state under a non-empty query', () => {
    const at = within(mount({ rows: 0, query: 'x', feed: { search: { kind: 'unsupported' } }, onQuery: vi.fn() }))
    expect(at.getByText('This khaosd cannot search the story’s history. Update khaosd to search it.')).toBeTruthy()
    expect(at.getByRole('searchbox', { name: 'Search changes' }).value).toBe('x')
    expect(at.queryByText('This khaosd cannot read the story’s history')).toBeNull()
  })
})

describe('the existing read states are unchanged', () => {
  it.each([
    [{ kind: 'loading' }, 'Reading activity…'],
    [{ kind: 'missing' }, 'No committed story'],
    [{ kind: 'failed', message: 'khaosd is not running.' }, 'Could not read the activity'],
  ])('the Activity window draws %o as before', (state, title) => {
    const at = within(surfaces[0].mount({ state, rows: 0 }))
    expect(at.getByText(title)).toBeTruthy()
    expect(at.queryByText('This khaosd cannot read the story’s history')).toBeNull()
  })

  it('the Activity window draws an unfiltered feed with no rows as an empty story', () => {
    const at = within(surfaces[0].mount({ rows: 0 }))
    expect(at.getByText('No committed changes')).toBeTruthy()
  })

  it.each([
    [{ kind: 'loading' }, 'Reading activity…'],
    [{ kind: 'missing' }, 'No committed activity yet'],
    [{ kind: 'failed', message: 'khaosd is not running.' }, 'khaosd is not running.'],
  ])('the Story Atlas activity panel draws %o as before', (state, text) => {
    const at = within(surfaces[1].mount({ state, rows: 0 }))
    expect(at.getByText(text)).toBeTruthy()
    expect(at.queryByText('This khaosd cannot read the story’s history')).toBeNull()
  })
})

describe.each(surfaces)('$name, with no paging props', ({ name, mount }) => {
  it('draws no older action, no search state and no paging count', () => {
    const at = within(mount({ rows: 2, paged: false }))
    expect(at.queryByRole('button', { name: /older/ })).toBeNull()
    expect(at.queryByText(/^Showing /)).toBeNull()
    expect(at.queryByRole('searchbox', { name: 'Search changes' })).toBeNull()
    expect(at.getByText('merge.row1')).toBeTruthy()
    if (name === 'the Activity window') expect(at.getByRole('searchbox', { name: 'Filter changes' })).toBeTruthy()
  })
})
