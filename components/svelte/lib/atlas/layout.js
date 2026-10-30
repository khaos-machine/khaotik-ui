// Story Atlas: moved from Khaos App's src/ui/atlas/layout.js (catalog app-coverage plan, T7).
import { nodeSize } from './appearance.js'
/** Geometry only: every lens, neighborhood and region membership is supplied by khaosd. */
export function createLayouts(atlas) {
  const max = Object.fromEntries(
    ['character', 'location'].map((kind) => [
      kind,
      Math.max(1, ...atlas.lenses[kind].nodes.map((n) => n.raw.scene_count)),
    ]),
  )
  const size = (n) => ({
    ...n,
    size:
      n.kind === 'scene'
        ? 66
        : Math.sqrt(64 ** 2 + (n.raw.scene_count / max[n.kind]) * (210 ** 2 - 64 ** 2)),
  })
  const nodes = atlas.lenses.all.nodes.map(size),
    edges = atlas.lenses.all.edges
  const lensNodes = (kind) => atlas.lenses[kind].nodes.map(size)
  function contributionLayout(kind) {
    const ranked = lensNodes(kind).toSorted(
      (a, b) => b.raw.scene_count - a.raw.scene_count || a.label.localeCompare(b.label),
    )
    if (!ranked.length)
      return {
        nodes: [],
        edges: atlas.lenses[kind].edges,
        width: 1400,
        height: 1000,
        contribution: true,
      }
    const placed = []
    for (const node of ranked) {
      const size = nodeSize(node)
      let position
      // Deterministic packing; include space for the persistent name and count.
      for (let attempt = 0; attempt < 12000; attempt++) {
        const angle = attempt * 2.3999632297,
          radius = Math.sqrt(attempt) * 7
        const x = Math.cos(angle) * radius * 1.9,
          y = Math.sin(angle) * radius
        if (
          placed.every((p) => {
            const otherSize = nodeSize(p)
            const separateX =
              Math.abs(x - p.x) > (Math.max(220, size) + Math.max(220, otherSize)) / 2 + 20
            const separateY =
              y - size / 2 > p.y + otherSize / 2 + 145 || p.y - otherSize / 2 > y + size / 2 + 145
            return separateX || separateY
          })
        ) {
          position = { x, y }
          break
        }
      }
      if (!position) throw new Error(`Could not position ${node.label}`)
      placed.push({ ...node, ...position })
    }
    const left = Math.min(...placed.map((p) => p.x - nodeSize(p) / 2)) - 100
    const top = Math.min(...placed.map((p) => p.y - nodeSize(p) / 2)) - 80
    const right = Math.max(...placed.map((p) => p.x + nodeSize(p) / 2)) + 100
    const bottom = Math.max(...placed.map((p) => p.y + nodeSize(p) / 2)) + 190
    const ties = atlas.lenses[kind].edges
    return {
      nodes: placed.map((p) => ({ ...p, x: p.x - left, y: p.y - top })),
      edges: ties,
      width: right - left,
      height: bottom - top,
      contribution: true,
    }
  }

  function sequenceLayout() {
    const scenes = lensNodes('scene')
    const columns = 8,
      gapX = 170,
      gapY = 150
    const ordered = scenes.map((n, i) => {
      const row = Math.floor(i / columns),
        column = i % columns
      return { ...n, x: 100 + (row % 2 ? columns - 1 - column : column) * gapX, y: 90 + row * gapY }
    })
    return {
      nodes: ordered,
      edges: atlas.lenses.scene.edges,
      sequence: ordered,
      labelSpacing: gapX,
      width: 200 + (columns - 1) * gapX,
      height: 180 + Math.floor((scenes.length - 1) / columns) * gapY,
    }
  }

  function neighbors(id) {
    return new Set(
      atlas.neighborhoods[id]?.nodes.map((n) => n.id).filter((other) => other !== id) ?? [],
    )
  }

  const W = 1400,
    H = 1000
  function constellation() {
    const points = nodes.map((node, i) => {
      const angle = i * 2.3999632297
      const radius = Math.sqrt((i + 1) / nodes.length) * 440
      return {
        ...node,
        x: W / 2 + Math.cos(angle) * radius * 1.3,
        y: H / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      }
    })
    const byId = new Map(points.map((n) => [n.id, n]))
    for (let step = 0; step < 210; step++) {
      for (let i = 0; i < points.length; i++) {
        const a = points[i]
        for (let j = i + 1; j < points.length; j++) {
          const b = points[j],
            dx = a.x - b.x,
            dy = a.y - b.y
          const distance = Math.max(1, Math.hypot(dx, dy))
          const force = Math.min(5, 1600 / (distance * distance))
          a.vx += (dx / distance) * force
          a.vy += (dy / distance) * force
          b.vx -= (dx / distance) * force
          b.vy -= (dy / distance) * force
        }
        a.vx += (W / 2 - a.x) * 0.0015
        a.vy += (H / 2 - a.y) * 0.0015
      }
      for (const edge of edges) {
        const a = byId.get(edge.source),
          b = byId.get(edge.target)
        const dx = b.x - a.x,
          dy = b.y - a.y,
          d = Math.max(1, Math.hypot(dx, dy))
        const force = (d - 120) * 0.009
        a.vx += (dx / d) * force
        a.vy += (dy / d) * force
        b.vx -= (dx / d) * force
        b.vy -= (dy / d) * force
      }
      for (const p of points) {
        p.vx *= 0.65
        p.vy *= 0.65
        p.x = Math.max(60, Math.min(W - 60, p.x + p.vx))
        p.y = Math.max(70, Math.min(H - 70, p.y + p.vy))
      }
    }
    const minX = Math.min(...points.map((p) => p.x)),
      maxX = Math.max(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y)),
      maxY = Math.max(...points.map((p) => p.y))
    return points.map((p) => ({
      ...p,
      x: 90 + ((p.x - minX) / (maxX - minX || 1)) * (W - 180),
      y: 90 + ((p.y - minY) / (maxY - minY || 1)) * (H - 180),
    }))
  }
  const constellationPoints = constellation()

  function layout(variant, selectedId) {
    if (variant === 'D') return locationClusters()
    if (variant === 'E') return entityRegions()
    if (variant === 'A') return freeMap()
    if (variant === 'B') {
      // All scenes remain in screenplay order. Unrelated nodes are never dropped.
      const orderedScenes = lensNodes('scene')
      const sceneX = new Map(orderedScenes.map((n, i) => [n.id, 100 + i * 190]))
      const width = 200 + (orderedScenes.length - 1) * 190
      const groups = { character: lensNodes('character'), location: lensNodes('location') }
      const points = nodes.map((n) => {
        if (n.kind === 'scene') return { ...n, x: sceneX.get(n.id), y: 500 }
        const group = groups[n.kind],
          i = group.indexOf(n)
        return {
          ...n,
          x: 100 + (i * (width - 200)) / Math.max(1, group.length - 1),
          y: n.kind === 'character' ? 180 + (i % 2) * 105 : 745 + (i % 2) * 105,
        }
      })
      return {
        nodes: points,
        edges,
        sequence: points.filter((n) => n.kind === 'scene'),
        labelSpacing: 190,
        width,
        height: H,
      }
    }
    const center = nodes.find((n) => n.id === selectedId) ?? nodes[0]
    if (!center) return { nodes: [], edges: [], width: W, height: H }
    const ids = neighbors(center.id)
    const surrounding = nodes.filter((n) => ids.has(n.id))
    const points = [
      { ...center, x: W / 2, y: H / 2 },
      ...surrounding.map((n, i) => {
        const ring = Math.floor(i / 18),
          count = Math.min(18, surrounding.length - ring * 18)
        const a = ((i % 18) / count) * Math.PI * 2 - Math.PI / 2
        const r = 230 + ring * 125
        return { ...n, x: W / 2 + Math.cos(a) * r * 1.3, y: H / 2 + Math.sin(a) * r }
      }),
    ]
    const sequence = points
      .filter((n) => n.kind === 'scene')
      .toSorted((a, b) => a.number - b.number)
    // A character's scenes form a reading sequence rather than a random radial ring.
    const count = sequence.length
    for (let i = 0; center.kind !== 'scene' && i < count; i++) {
      const n = sequence[i],
        row = Math.floor(i / 6),
        column = i % 6
      n.x = 160 + (row % 2 ? 5 - column : column) * 210
      n.y = 220 + row * 145
    }
    if (center.kind !== 'scene') {
      points[0].x = W / 2
      points[0].y = 80
    }
    return {
      nodes: points,
      edges: atlas.neighborhoods[center.id].edges,
      sequence,
      labelSpacing: 210,
      width: W,
      height: H,
    }
  }

  // Display the engine-supplied screenplay links within the visible geometry.
  function withSequence(graph) {
    if (!graph.sequence) return graph
    const visible = new Set(graph.nodes.map((n) => n.id))
    return {
      ...graph,
      edges: [
        ...graph.edges,
        ...atlas.lenses.scene.edges.filter((e) => visible.has(e.source) && visible.has(e.target)),
      ],
    }
  }

  function packRegions(regions, columns, memberColumns, spanning = false) {
    const padding = 56,
      header = 110,
      gutter = 72,
      unitWidth = 600
    const heights = Array(columns).fill(80)
    const points = [],
      groups = []
    let nextX = 80
    for (const region of regions) {
      const count = region.members.length
      const span = spanning && count > 9 ? 2 : 1
      const cols = Math.min(
        region.columns ?? (spanning ? (span === 2 ? 5 : 3) : memberColumns),
        count,
      )
      const width = spanning
        ? span === 2
          ? span * unitWidth + gutter
          : cols * 160 + padding * 2
        : cols * 190 + padding * 2
      let column = 0,
        y = 80
      if (spanning) {
        y = Infinity
        for (let i = 0; i <= columns - span; i++) {
          const top = Math.max(...heights.slice(i, i + span))
          if (top < y) {
            y = top
            column = i
          }
        }
      }
      const x = spanning ? 80 + column * (unitWidth + gutter) : nextX
      const cellWidth = (width - padding * 2) / cols
      const members = []
      let cursor = header + 24
      for (let start = 0; start < count; start += cols) {
        const row = region.members.slice(start, start + cols)
        const radius = Math.max(...row.map((n) => (n.kind === 'scene' ? 30 : nodeSize(n) * 0.35)))
        const rowHeight = radius * 2 + 120
        for (let i = 0; i < row.length; i++) {
          const cell = region.ordered && Math.floor(start / cols) % 2 ? cols - 1 - i : i
          members.push({
            ...row[i],
            x: x + padding + cellWidth * (cell + 0.5),
            y: y + cursor + radius + 16,
            labelSpacing: cellWidth,
            rowHeight,
          })
        }
        cursor += rowHeight
      }
      const height = cursor + 24
      points.push(...members)
      groups.push({
        id: region.id,
        label: region.label,
        count,
        memberIds: members.map((n) => n.id),
        x,
        y,
        width,
        height,
        header,
      })
      if (spanning) for (let i = column; i < column + span; i++) heights[i] = y + height + gutter
      else nextX += width + gutter
    }
    return {
      nodes: points,
      edges,
      groups,
      width: Math.max(...groups.map((g) => g.x + g.width)) + 80,
      height: Math.max(...groups.map((g) => g.y + g.height)) + 80,
    }
  }

  function locationClusters() {
    const byId = new Map(nodes.map((n) => [n.id, n]))
    return packRegions(
      atlas.locationGroups.map((g) => ({ ...g, members: g.memberIds.map((id) => byId.get(id)) })),
      6,
      4,
      true,
    )
  }

  function entityRegions() {
    const graph = packRegions(
      [
        { id: 'characters', label: 'Characters', members: lensNodes('character') },
        {
          id: 'scenes',
          label: 'Scenes in screenplay order',
          ordered: true,
          columns: 10,
          members: lensNodes('scene'),
        },
        { id: 'locations', label: 'Locations', members: lensNodes('location') },
      ],
      3,
      6,
    )
    return { ...graph, sequence: graph.nodes.filter((n) => n.kind === 'scene') }
  }

  let freeMapCache
  function freeMap() {
    if (freeMapCache) return freeMapCache
    const width = 2400,
      height = 1700,
      placed = []
    for (const node of [...constellationPoints].sort(
      (a, b) => nodeSize(b) - nodeSize(a) || a.id.localeCompare(b.id),
    )) {
      const radius = nodeSize(node) * 0.35 + 20
      const targetX = (node.x / W) * width,
        targetY = (node.y / H) * height
      let position
      for (let attempt = 0; attempt < 20000; attempt++) {
        const angle = attempt * 2.3999632297,
          distance = Math.sqrt(attempt) * 9
        const x = targetX + Math.cos(angle) * distance,
          y = targetY + Math.sin(angle) * distance
        if (
          x < radius + 40 ||
          x > width - radius - 40 ||
          y < radius + 40 ||
          y > height - radius - 40
        )
          continue
        if (placed.every((p) => Math.hypot(x - p.x, y - p.y) > radius + p.radius)) {
          position = { x, y }
          break
        }
      }
      if (!position) throw new Error(`Could not place ${node.label}`)
      placed.push({ ...node, ...position, radius })
    }
    freeMapCache = { nodes: placed, edges, width, height }
    return freeMapCache
  }

  return { layout, contributionLayout, sequenceLayout, withSequence, neighbors, nodes }
}
