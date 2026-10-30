// Story Atlas: moved from Khaos App's src/ui/atlas/edges.js (catalog app-coverage plan, T7).
import { Graphics, Point } from 'pixi.js'
import { dashed, onTap } from './drawing.js'
import {edgeKey} from './appearance.js'
export function focusConnection({ scene, app, camera, fitScale, reducedMotion }, edge) {
  const a = scene.graph.nodes.find((n) => n.id === edge.source),
    b = scene.graph.nodes.find((n) => n.id === edge.target)
  if (!a || !b) return
  const spanX = Math.abs(a.x - b.x) + 300,
    spanY = Math.abs(a.y - b.y) + 300
  const scale = Math.min(app.screen.width / spanX, app.screen.height / spanY, fitScale * 1.65)
  const position = new Point((a.x + b.x) / 2, (a.y + b.y) / 2)
  camera.plugins.remove('animate')
  if (reducedMotion) {
    camera.setZoom(scale)
    camera.moveCenter(position)
  } else
    camera.animate({ position, scale, time: 650, ease: 'easeInOutSine', removeOnInterrupt: true })
}
export function drawEdges({
  lines,
  scene,
  records,
  selected,
  hovered,
  camera,
  edgeTargets,
  edgeLayer,
  palette,
  callbacks,
}) {
  lines.clear()
  if (!scene) return
  const byId = new Map(records.filter((r) => !r.exiting).map((r) => [r.node.id, r.group.position]))
  const liveEdges = new Set()
  const visiblePairs = new Set()
  const membership = new Map(
    (scene.graph.groups ?? []).flatMap((g) => g.memberIds.map((id) => [id, g.id])),
  )
  const lineWidth = 1.1 / camera.scale.x
  for (const edge of scene.graph.edges) {
    const a = byId.get(edge.source),
      b = byId.get(edge.target)
    if (!a || !b) continue
    const key = edgeKey(edge)
    const chosen = scene.selectedEdge && edgeKey(scene.selectedEdge) === key
    const active = chosen || edge.source === selected || edge.target === selected
    const over = edge.source === hovered || edge.target === hovered
    const within = membership.get(edge.source) === membership.get(edge.target)
    const ordered = ['Next scene', 'Next visible scene'].includes(edge.kind)
    const revealOnDemand =
      membership.size ||
      (scene.variant === 'A' && scene.kind === 'all') ||
      (scene.variant === 'B' && scene.kind === 'all')
    const ordinaryVisible = ordered
      ? scene.variant !== 'A'
      : edge.kind === 'set at' && scene.variant !== 'B'
    const alpha =
      active || over
        ? 1
        : selected || scene.selectedEdge
          ? 0
          : revealOnDemand && (!ordinaryVisible || (membership.size && !within))
            ? 0
            : 0.78
    if (!alpha) continue
    visiblePairs.add(`${edge.source}:${edge.target}`)
    liveEdges.add(key)
    let hit = edgeTargets.get(key)
    if (!hit) {
      hit = new Graphics({ eventMode: 'static', cursor: 'pointer' })
      hit.accessible = true
      hit.accessibleType = 'button'
      hit.tabIndex = 0
      hit.accessiblePointerEvents = 'none'
      const from = scene.graph.nodes.find((n) => n.id === edge.source),
        to = scene.graph.nodes.find((n) => n.id === edge.target)
      hit.accessibleTitle = `Connection: ${from.label} to ${to.label}, ${edge.kind}`
      onTap(hit, () => {
        callbacks.onSelectEdge(edge)
      })
      edgeTargets.set(key, hit)
      edgeLayer.addChild(hit)
    }
    hit
      .clear()
      .moveTo(a.x, a.y)
      .lineTo(b.x, b.y)
      .stroke({ color: palette('--text-primary'), alpha: 0.001, width: 16 / camera.scale.x })

    if (edge.kind === 'set at')
      dashed(
        lines,
        a,
        b,
        active ? palette('--text-brand') : palette('--text-secondary'),
        alpha,
        lineWidth,
      )
    else
      lines
        .moveTo(a.x, a.y)
        .lineTo(b.x, b.y)
        .stroke({
          color: active ? palette('--text-brand') : palette('--text-secondary'),
          alpha,
          width: lineWidth,
        })
  }
  for (let i = 1; i < (scene.graph.sequence?.length ?? 0); i++) {
    const a = byId.get(scene.graph.sequence[i - 1].id),
      b = byId.get(scene.graph.sequence[i].id)
    if (
      !a ||
      !b ||
      !visiblePairs.has(`${scene.graph.sequence[i - 1].id}:${scene.graph.sequence[i].id}`)
    )
      continue
    const angle = Math.atan2(b.y - a.y, b.x - a.x),
      x = (a.x + b.x) / 2,
      y = (a.y + b.y) / 2,
      r = 4 / camera.scale.x
    lines
      .poly([
        x + Math.cos(angle) * r,
        y + Math.sin(angle) * r,
        x + Math.cos(angle + 2.5) * r,
        y + Math.sin(angle + 2.5) * r,
        x + Math.cos(angle - 2.5) * r,
        y + Math.sin(angle - 2.5) * r,
      ])
      .fill({ color: palette('--text-secondary'), alpha: 1 })
  }
  for (const [key, hit] of edgeTargets)
    if (!liveEdges.has(key)) {
      hit.destroy()
      edgeTargets.delete(key)
    }
}
