import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Shape from './Shape.svelte'
import { radius, sizes } from '@khaos-machine/khaotik-ui/tokens/parse.js'

describe('Shape screen', () => {
  it('renders the header and every section heading', () => {
    render(Shape)
    expect(screen.getByRole('region', { name: /Khaotik Shape/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Radius' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Target & stroke' })).toBeInTheDocument()
  })

  // The reach half for Color.test.js's "no longer carries the shape section".
  it('draws every radius tier at its declared corner', () => {
    const { container } = render(Shape)
    const boxes = [...container.querySelectorAll('.radius__box')]
    expect(boxes.map((el) => el.style.borderRadius)).toEqual(['4px', '6px', '8px', '999px'])
    expect(boxes.length).toBe(radius.length)
  })

  it('names every measurement it draws', () => {
    render(Shape)
    for (const token of [...radius, ...sizes]) {
      expect(
        screen.getByRole('button', { name: `Copy --${token.name}: ${token.value}` }),
        token.name,
      ).toBeInTheDocument()
    }
  })

  it('carries no colour or type sections', () => {
    const { container } = render(Shape)
    expect(container.querySelectorAll('.swatch').length).toBe(0)
    expect(container.querySelectorAll('.type-row').length).toBe(0)
  })
})
