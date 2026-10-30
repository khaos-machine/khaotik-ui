// The viewport the canvas frames a component in, as THREE independent choices:
// device, orientation, and size-within-device.
//
// WHY THREE AND NOT ONE. An earlier pass carried a single flat list of eleven
// presets. It collapsed three unrelated questions into one menu, which made the
// cheap, frequent choice (phone or desktop?) cost the same as the rare, fiddly
// one (which phone width?) and put them in the same alphabet. Split, each
// control matches the weight of its own decision: device is three icons and one
// click, orientation is two, and the size list — the least dramatic choice, and
// the one you touch least — is the only thing that needs a dropdown.
//
// The size list is SCOPED TO THE DEVICE. 390 is not a tablet width and 1536 is
// not a phone, so a global size list would be mostly wrong at any moment, and
// would have to be read to find that out.
//
// WHERE THE NUMBERS COME FROM. None are invented; a made-up width would be a
// fabricated device, and this repo does not fabricate its data.
//
//   - Device sizes are Storybook's viewport presets, taken from its defaults
//     source. The presets outlived the tool: this library published to Storybook
//     until D61 retired it, and the numbers are a published, citable set either
//     way, which is the only reason they are here.
//     https://storybook.js.org/docs/essentials/viewport
//   - Web sizes are Tailwind's default breakpoints — md 768, lg 1024, xl 1280,
//     2xl 1536 — the most widely deployed published set, and therefore the ones
//     a consuming app is most likely to have actually built against.
//     https://tailwindcss.com/docs/responsive-design
//   - The three DEVICE tiers are Material 3's window size classes: compact
//     below 600dp, medium 600-839, expanded 840+. Mobile sits in compact,
//     tablet spans medium into expanded, web is expanded and up.
//     https://m3.material.io/foundations/layout/breakpoints/overview
//
// Sizes are stated PORTRAIT throughout — width shorter than height — and
// `orientation` is what turns them. Storing both would let the two disagree.

// `height: null` means "take the canvas height". A web breakpoint IS a width;
// Tailwind's `md` makes no claim about how tall the window is, so pinning a
// height there would invent a constraint the source does not carry. A handset is
// a fixed rectangle, so it carries both.
export const DEVICES = [
  {
    id: 'mobile',
    label: 'Mobile',
    icon: 'device-mobile',
    // Compact (<600dp).
    orientable: true,
    sizes: [
      { id: 'sm', label: 'Small · 320', width: 320, height: 568 },
      { id: 'se', label: 'SE · 375', width: 375, height: 667 },
      { id: 'base', label: 'Standard · 390', width: 390, height: 844 },
      { id: 'max', label: 'Max · 430', width: 430, height: 932 },
    ],
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: 'device-tablet',
    // Medium (600-839dp) at the low end, expanded by the 12.9-inch.
    orientable: true,
    sizes: [
      { id: 'base', label: 'iPad · 768', width: 768, height: 1024 },
      { id: 'pro11', label: 'Pro 11-inch · 834', width: 834, height: 1194 },
      { id: 'pro13', label: 'Pro 12.9-inch · 1024', width: 1024, height: 1366 },
    ],
  },
  {
    id: 'web',
    label: 'Web',
    icon: 'monitor',
    // Orientation is not a property of a browser window the way it is of a
    // handset — you do not turn a laptop on its side — so the control disables
    // here rather than offering a choice that means nothing.
    orientable: false,
    sizes: [
      // The unframed canvas, and the default. It is what the canvas did before
      // this control existed: adding a viewport picker should not silently
      // reframe every fixture in the catalog.
      { id: 'fill', label: 'Fill canvas', width: null, height: null },
      { id: 'md', label: 'md · 768', width: 768, height: null },
      { id: 'lg', label: 'lg · 1024', width: 1024, height: null },
      { id: 'xl', label: 'xl · 1280', width: 1280, height: null },
      { id: '2xl', label: '2xl · 1536', width: 1536, height: null },
    ],
  },
]

export const DEFAULT_DEVICE = 'web'
export const DEFAULT_ORIENTATION = 'portrait'

export function findDevice(id) {
  return DEVICES.find((d) => d.id === id) ?? DEVICES[DEVICES.length - 1]
}

// Each device's own first entry, so switching device lands somewhere valid
// rather than carrying a size id that means nothing in the new list. `base` is
// deliberately each device's most ordinary size, not its smallest.
export function defaultSizeFor(deviceId) {
  const device = findDevice(deviceId)
  return (device.sizes.find((s) => s.id === 'base') ?? device.sizes[0]).id
}

export function findSize(deviceId, sizeId) {
  const device = findDevice(deviceId)
  return device.sizes.find((s) => s.id === sizeId) ?? device.sizes[0]
}

// The one function the canvas needs: three choices in, a box out. `enabled` is
// how a section that has nothing to frame (BrandKit) switches the whole feature
// off without the canvas having to know which section it is looking at.
export function resolveFrame({ device, size, orientation, enabled = true }) {
  const found = findDevice(device)
  const chosen = findSize(found.id, size)
  const turned = enabled && found.orientable && orientation === 'landscape'

  if (!enabled || chosen.width === null) {
    return { width: null, height: null, device: found.id, size: chosen.id, rotated: false }
  }

  return {
    device: found.id,
    size: chosen.id,
    rotated: turned,
    width: turned ? chosen.height : chosen.width,
    height: turned ? chosen.width : chosen.height,
  }
}

// What the controls say about themselves on hover. The only place a height
// appears for a device, since the size labels carry width alone.
export function frameSummary(state) {
  const { width, height } = resolveFrame(state)
  if (width === null) return 'fills the canvas'
  return height === null ? `${width} wide` : `${width} × ${height}`
}
