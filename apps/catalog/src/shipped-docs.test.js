import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname, normalize } from 'node:path'

// The designer docs ship in the npm package, so an agent in a consuming app
// reads them from node_modules. A relative link there works only if its target
// shipped too; a link to a file `files` leaves out resolves on GitHub and
// nowhere else. This reads the real manifest and the real pages.

const ROOT = join(import.meta.dirname, '../../..')
const files = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).files
const included = files.filter((f) => !f.startsWith('!'))
const shippedDocs = included.filter((f) => f.endsWith('.md'))

const ships = (path) =>
  !files.includes(`!${path}`) &&
  included.some((f) => path === f || path.startsWith(`${f}/`))

function relativeLinks(doc) {
  const text = readFileSync(join(ROOT, doc), 'utf8')
  return [...text.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m[1])
    .filter((href) => !/^[a-z]+:/i.test(href) && !href.startsWith('#'))
}

describe('shipped docs', () => {
  it('ship the designer pages and the guide they link to', () => {
    expect(shippedDocs).toEqual(
      expect.arrayContaining([
        'docs/design/README.md',
        'docs/design/changing-the-kit.md',
        'docs/using-the-library.md',
      ]),
    )
  })

  it.each(shippedDocs)('%s links only to files that ship with it', (doc) => {
    const broken = relativeLinks(doc)
      .map((href) => normalize(join(dirname(doc), href.split('#')[0])))
      .filter((target) => !ships(target) || !existsSync(join(ROOT, target)))
    expect(broken).toEqual([])
  })
})
