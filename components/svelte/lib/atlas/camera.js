// Story Atlas: moved from Khaos App's src/ui/atlas/camera.js (catalog app-coverage plan, T7).
import { Point } from 'pixi.js'
export function fitGraph({ scene, selected, app, camera, reducedMotion }, animate = true) {
  const { graph, variant, kind } = scene
  const fitScale =
    Math.min(
      app.screen.width / graph.width,
      Math.max(200, app.screen.height - 200) / graph.height,
    ) * 0.92
  const spine = variant === 'B' && kind === 'all'
  const scale = spine ? Math.max(0.65, fitScale) : fitScale
  const target = spine ? graph.nodes.find((n) => n.id === selected) : null
  camera.resize(app.screen.width, app.screen.height, graph.width, graph.height)
  camera.clampZoom({ minScale: fitScale * 0.3, maxScale: 3 })
  const start = spine
    ? Math.min(graph.width / 2, app.screen.width / (2 * scale) - 60 / scale)
    : graph.width / 2
  const position = new Point(target?.x ?? start, graph.height / 2 - (graph.groups ? 50 / scale : 0))
  camera.plugins.remove('animate')
  if (animate && !reducedMotion)
    camera.animate({ position, scale, time: 450, ease: 'easeInOutSine', removeOnInterrupt: true })
  else {
    camera.setZoom(scale)
    camera.moveCenter(position)
  }
  return fitScale
}

export function focusNode({ scene, camera, fitScale, reducedMotion }, id, emphasis = 1.9) {
  const node = scene?.graph.nodes.find((n) => n.id === id)
  if (!node) return
  camera.plugins.remove('animate')
  const scale = Math.min(2, Math.max(camera.scale.x, fitScale * emphasis))
  if (reducedMotion) {
    camera.setZoom(scale)
    camera.moveCenter(node.x, node.y)
  } else
    camera.animate({
      position: new Point(node.x, node.y),
      scale,
      time: 650,
      ease: 'easeInOutSine',
      removeOnInterrupt: true,
    })
}
