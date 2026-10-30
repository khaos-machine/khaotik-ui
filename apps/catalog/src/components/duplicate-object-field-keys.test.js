import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BarChart from '@khaos-machine/khaotik-ui/components/svelte/BarChart.svelte'
import WelcomeWindow from '@khaos-machine/khaotik-ui/components/svelte/WelcomeWindow.svelte'
// The fourth shape, and the reason it needed a fourth sweep: these key on a
// STRING FIELD OF AN OBJECT, or on a value assembled inside the component. The
// previous sweep looked for bare string arrays (`as t (t)`) and could not see
// either.
//
// That is now four searches, each shaped like the defect before it, each
// finding sites the last one walked past:
//   1. `entity.id ?? fallback`   -> the ?? shape
//   2. `entity.id`               -> the bare-id shape
//   3. `as t (t)`                -> the string-array shape
//   4. `(obj.field)` and derived -> this one
// The lesson is written into duplicate-string-keys.test.js and was still true
// one sweep later.

describe('duplicate object-field keys must not abort the render', () => {
  it('BarChart survives two rows sharing a label', () => {
    const data = [
      { label: 'DAY', value: 12 },
      { label: 'DAY', value: 4 },
      { label: 'NIGHT', value: 7 },
    ]
    const { container } = render(BarChart, { props: { data } })
    expect(container.textContent).toContain('DAY')
  })

  it('WelcomeWindow survives repeated component and service names', () => {
    const engine = {
      daemonVersion: '0.9.1',
      components: [
        { name: 'khaosd', state: 'ready' },
        { name: 'khaosd', state: 'ready' },
      ],
      services: [
        { name: 'api', state: 'running' },
        { name: 'api', state: 'running' },
      ],
    }
    const { container } = render(WelcomeWindow, { props: { engine } })
    expect(container.textContent).toContain('Ready')
  })

  // The last two, and both were classified SAFE by me and cleared by review
  // before being probed. `row.label + i` and `project.id || project.path` each
  // look like they carry something unique and do not.

  it('WelcomeWindow survives two recents entries sharing a path, and a cold start with neither field', () => {
    const dupPath = [
      { id: '', path: '/Users/k/khaos/projects/a.kspd', title: 'A' },
      { id: '', path: '/Users/k/khaos/projects/a.kspd', title: 'A again' },
    ]
    expect(() => render(WelcomeWindow, { props: { projects: dupPath } })).not.toThrow()

    const coldStart = [
      { id: '', path: '', title: 'One' },
      { id: '', path: '', title: 'Two' },
    ]
    const { container } = render(WelcomeWindow, { props: { projects: coldStart } })
    expect(container.textContent).toContain('One')
    expect(container.textContent).toContain('Two')
  })
})
