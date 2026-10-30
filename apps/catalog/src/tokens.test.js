import { describe, it, expect } from 'vitest'
import css from '@khaos-machine/khaotik-ui/tokens/tokens.css?raw'

describe('BrandKit tokens', () => {
  const required = [
    '--surface-base',
    '--surface-raised',
    '--action-primary',
    '--action-primary-border',
    '--action-primary-pressed',
    '--text-primary',
    '--text-secondary',
    '--border-default',
    '--border-hairline',
  ]

  it('exposes every semantic token the components reference', () => {
    for (const v of required) {
      expect(css).toContain(v)
    }
  })

  it('ships the warm-gray neutrals, not the deprecated indigo/eggplant', () => {
    expect(css).toContain('--surface-base:var(--warm-950)') // dark
    expect(css).toContain('--surface-base:var(--warm-100)') // light
    expect(css).toContain('--warm-950:#171615')
    expect(css).toContain('--warm-50:#f5f4f2')
  })

  it('ships both modes (dark default + light) with the accent/skipped statuses', () => {
    expect(css).toContain(':root,')
    expect(css).toContain('html[data-theme="light"]{')
    expect(css).toContain('--status-accent-fg')
    expect(css).toContain('--status-skipped-fg')
  })
})
