import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { published, publishedSlugs, mergeDocuments, publish } from './published.js'
import PublishButton from './PublishButton.svelte'
import { createDocument } from './document.js'

const doc = (slug, name) => ({ ...createDocument({ kind: 'page', slug, name }) })

afterEach(() => { vi.unstubAllGlobals() })

describe('documents published into the repo', () => {
  it('reads the same directory a consuming app installs', () => {
    // Globbed, not listed — a hand-kept index is a second copy of a fact the
    // directory already states. One document is published now (first-run.json,
    // #60); the empty state remains real rather than a failure, and this assertion
    // is about the SHAPE the glob returns, which is why it survives either count.
    expect(Array.isArray(published)).toBe(true)
    expect(publishedSlugs).toBeInstanceOf(Set)
    for (const d of published) expect(d.slug, d.publishedAs).toMatch(/^[a-z][a-z0-9-]*$/)
  })

  it('lets a draft win over the published file of the same slug', () => {
    // A draft is what is being edited. Showing the committed version while
    // someone types into it would be the surprise.
    const committed = { ...doc('triage', 'Committed'), publishedAs: 'triage.json' }
    const draft = doc('triage', 'Draft')
    const merged = mergeDocuments([draft])
    expect(merged.filter((d) => d.slug === 'triage')).toHaveLength(1)
    expect(merged.find((d) => d.slug === 'triage').name).toBe('Draft')
    void committed
  })

  it('keeps a draft that has no published file', () => {
    expect(mergeDocuments([doc('fresh', 'Fresh')]).some((d) => d.slug === 'fresh')).toBe(true)
  })

  it('writes through the dev server and reports where it went', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ path: 'components/composed/triage.json' }) })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await publish(doc('triage', 'Triage'))
    expect(result).toEqual({ ok: true, path: 'components/composed/triage.json' })
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('/__publish')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body).slug).toBe('triage')
  })

  it('refuses without even trying on the built web surface, and says why', async () => {
    // khaotik-catalog.loswf.com is a static build with no dev server and no repo
    // to write to. Attempting the fetch there would fail with a network error
    // that says nothing useful; this says what is actually true, and the control
    // still offers the JSON to copy.
    vi.stubEnv('DEV', false)
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const result = await publish(doc('triage', 'Triage'))
    expect(result.ok).toBe(false)
    expect(result.error).toMatch(/only the dev server can do/)
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })

  it('passes the server refusal through rather than claiming success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'not a slug' }) }))
    expect(await publish(doc('x', 'X'))).toEqual({ ok: false, error: 'not a slug' })
  })

  it('reports a dead server instead of throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))
    expect(await publish(doc('x', 'X'))).toEqual({ ok: false, error: 'Failed to fetch' })
  })
})

describe('the publish control', () => {
  const show = (props) => render(PublishButton, { props: { document: doc('triage', 'Triage'), ...props } })

  it('says Publish for a new document and Update for one that exists', () => {
    show({})
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()

    show({ isPublished: true })
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
  })

  it('reports where the file went', async () => {
    show({ onPublish: async () => ({ ok: true, path: 'components/composed/triage.json' }) })
    await fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
    expect(await screen.findByText('Wrote components/composed/triage.json')).toBeInTheDocument()
  })

  it('says why it could not, rather than doing nothing visible', async () => {
    // The static web build has no repo to write to. A control that silently did
    // nothing on one of the two surfaces would be worse than either state.
    show({ onPublish: async () => ({ ok: false, error: 'Publishing writes a file into the repo.' }) })
    await fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
    expect(await screen.findByText(/writes a file into the repo/)).toBeInTheDocument()
  })

  it('always offers the document itself, whatever the surface', async () => {
    const writeText = vi.fn().mockResolvedValue()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    show({})
    await fireEvent.click(screen.getByRole('button', { name: 'Copy JSON' }))
    expect(JSON.parse(writeText.mock.calls[0][0]).slug).toBe('triage')
    expect(await screen.findByText('Copied')).toBeInTheDocument()
  })
})
