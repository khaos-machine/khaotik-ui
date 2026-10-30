// Story Atlas: moved from Khaos App's src/ui/atlas/pixi-atlas.js (catalog app-coverage plan, T7).
import { fitGraph, focusNode } from './camera.js'
import { Application, Container, Graphics, Sprite, Texture, Text, Rectangle, Point } from 'pixi.js'
// Use static shader/uniform functions under the packaged app's strict CSP.
import 'pixi.js/unsafe-eval'
import 'pixi.js/accessibility'
import { Viewport } from 'pixi-viewport'
import { texture, iconFont, onTap, createLabelFitter } from './drawing.js'
import { drawEdges, focusConnection } from './edges.js'
import { nodeSize, stateLabel, tones, edgeKey } from './appearance.js'

/** App-owned WebGL renderer. All story facts come from the canonical engine read. */
export async function createAtlas(element, callbacks) {
  const app = new Application()
  await app.init({
    width: Math.max(1, element.clientWidth),
    height: Math.max(1, element.clientHeight),
    preference: 'webgl',
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(devicePixelRatio, 2),
    autoDensity: true,
    accessibilityOptions: {
      enabledByDefault: true,
      activateOnTab: false,
      deactivateOnMouseMove: false,
    },
  })
  app.ticker.maxFPS = 60
  app.canvas.setAttribute('aria-label', 'Pixi-rendered story atlas')
  element.append(app.canvas)
  // Pixi positions this overlay in page coordinates; body avoids a second host offset.
  const accessibility = app.renderer.accessibility.div
  document.body.append(accessibility)
  accessibility.classList.add('atlas-accessibility')
  accessibility.style.position = 'fixed'
  const camera = new Viewport({
    screenWidth: app.screen.width,
    screenHeight: app.screen.height,
    events: app.renderer.events,
    ticker: app.ticker,
  })
  app.stage.addChild(camera)
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  camera
    .drag()
    .pinch()
    .wheel({ smooth: reducedMotion ? false : 4 })
    .decelerate({ friction: reducedMotion ? 0 : 0.92 })
  const clusters = new Container()
  const lines = new Graphics()
  const edgeTargets = new Map()
  const edgeLayer = new Container()
  const bodies = new Container()
  camera.addChild(clusters, lines, edgeLayer, bodies)
  const portraits = new Map()
  const orb = texture()
  const compactLabel = createLabelFitter()
  const fonts = Object.fromEntries(['character', 'location'].map((k) => [k, iconFont(k)]))
  await Promise.all(Object.values(fonts).map((f) => document.fonts.load(`24px ${f.fontFamily}`)))
  let scene = null,
    signature = '',
    records = [],
    selected = '',
    hovered = '',
    related = new Set(),
    destroyed = false
  let fitScale = 1,
    frames = 0,
    sampleStart = performance.now(),
    lastTap = { id: '', at: 0 },
    motionStart = 0
  const css = getComputedStyle(element)
  const palette = (name) => css.getPropertyValue(name).trim()
  const colorFor = (state) =>
    css.getPropertyValue(`--tone-${tones[state] ?? 'neutral'}`).trim() ||
    palette('--text-secondary')

  let clusterRecords = []
  function drawClusters(rebuild = false) {
    if (!scene) return
    if (rebuild) {
      for (const child of clusters.removeChildren()) child.destroy({ children: true })
      clusterRecords = []
      for (const group of scene.graph.groups ?? []) {
        const frame = new Graphics({ cursor: 'pointer', eventMode: 'static' })
        frame.accessible = true
        frame.accessibleType = 'button'
        frame.tabIndex = 0
        frame.accessiblePointerEvents = 'none'
        frame.accessibleTitle = `Focus cluster: ${group.label}, ${group.count} story elements`
        onTap(frame, () => {
          const scale = Math.min(
            (app.screen.width - 180) / (group.width + 160),
            (app.screen.height - 260) / (group.height + 160),
            1.4,
          )
          const position = new Point(
            group.x + group.width / 2,
            group.y + group.height / 2 - 45 / scale,
          )
          camera.plugins.remove('animate')
          if (reducedMotion) {
            camera.setZoom(scale)
            camera.moveCenter(position)
          } else
            camera.animate({
              position,
              scale,
              time: 650,
              ease: 'easeInOutSine',
              removeOnInterrupt: true,
            })
        })
        const title = new Text({
          text: group.label,
          style: {
            fontFamily: 'system-ui',
            fontSize: 12,
            fontWeight: '600',
            fill: palette('--text-primary'),
            wordWrap: true,
            wordWrapWidth: 170,
          },
        })
        clusters.addChild(frame, title)
        clusterRecords.push({ group, frame, title })
      }
    }
    for (const { group, frame, title } of clusterRecords) {
      frame.hitArea = new Rectangle(group.x, group.y, group.width, group.height)
      frame
        .clear()
        .roundRect(group.x, group.y, group.width, group.height, 6 / camera.scale.x)
        .stroke({ color: palette('--text-secondary'), width: 1 / camera.scale.x, alpha: 0.5 })
      title.style.fill = palette('--text-primary')
      const titleWidth = Math.max(50, Math.min(240, group.width * camera.scale.x - 32))
      title.style.wordWrap = false
      title.text = compactLabel(
        group.label,
        titleWidth,
        '600',
        camera.scale.x < fitScale * 1.45 ? 1 : 2,
      )
      title.scale.set(1 / camera.scale.x)
      title.position.set(group.x + 16 / camera.scale.x, group.y + 8 / camera.scale.x)
    }
  }
  const edgeContext = () => ({
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
    app,
    fitScale,
    reducedMotion,
  })
  function drawLines() {
    drawEdges(edgeContext())
  }
  function focusEdge(edge) {
    focusConnection(edgeContext(), edge)
  }
  function fit(animate = true) {
    if (scene) fitScale = fitGraph({ scene, selected, app, camera, reducedMotion }, animate)
  }
  function focus(id, emphasis = 1.9) {
    focusNode({ scene, camera, fitScale, reducedMotion }, id, emphasis)
  }
  function refresh() {
    for (const r of records) {
      const active =
          r.node.id === selected ||
          (scene.selectedEdge &&
            [scene.selectedEdge.source, scene.selectedEdge.target].includes(r.node.id)),
        over = r.node.id === hovered
      r.targetAlpha = r.exiting ? 0 : 1
      if (!motionStart) r.group.alpha = r.targetAlpha
      r.group.zIndex = active || over ? 2 : 0
      r.body.tint = palette('--surface-raised')
      r.label.style.fill = palette('--text-primary')
      r.label.style.fontWeight = active ? '600' : '400'
      r.icon.style.fill = palette('--text-primary')
      r.count.style.fill = palette('--text-secondary')
      paintRim(r)
      r.reticle.clear()
      if (active || over) {
        const radius = r.radius + 12
        for (let i = 0; i < 4; i++)
          r.reticle.arc(0, 0, radius, (i * Math.PI) / 2, (i * Math.PI) / 2 + 0.6).stroke({
            color: active ? palette('--text-brand') : palette('--text-secondary'),
            width: 1.1 / camera.scale.x,
            alpha: 0.8,
          })
      }
    }
    drawLines()
    updateLabels()
    drawClusters()
    element.dataset.palette = JSON.stringify({
      selectedRim: records.find((r) => r.node.id === selected)?.rimColor ?? null,
      surface: palette('--surface-base'),
      raised: palette('--surface-raised'),
      text: palette('--text-primary'),
      secondary: palette('--text-secondary'),
      border: palette('--text-secondary'),
      unselectedRims: [
        ...new Set(records.filter((r) => r.node.id !== selected).map((r) => r.rimColor)),
      ],
    })
  }

  function updateLabels() {
    const scale = camera.scale.x
    for (const r of records) {
      const active = r.node.id === selected || r.node.id === hovered
      const detailed = scale > fitScale * 0.75
      r.label.visible =
        active ||
        (scene.selectedEdge &&
          [scene.selectedEdge.source, scene.selectedEdge.target].includes(r.node.id)) ||
        (scene.graph.groups && scale > fitScale * 1.45) ||
        (!scene.graph.groups && scene.graph.contribution) ||
        scene.kind === 'scene' ||
        (!scene.graph.groups &&
          detailed &&
          (scene.variant !== 'A' ||
            scene.kind !== 'all' ||
            (selected && related.has(r.node.id)) ||
            scale > fitScale * 1.5))
      const width = Math.max(
        48,
        Math.min(
          110,
          (r.node.labelSpacing ?? scene.graph.labelSpacing ?? Infinity) * scale -
            (scene.graph.groups ? 12 : 20),
        ),
      )
      r.label.style.wordWrapWidth = width
      r.label.style.wordWrap = false
      const maxLines =
        r.node.rowHeight && (r.node.rowHeight - r.radius * 2) * scale - 10 < 32 ? 1 : 2
      r.label.text = compactLabel(r.node.label, width, r.label.style.fontWeight, maxLines)
      r.label.scale.set(1 / scale)
      r.label.position.set(0, r.radius + 10 / scale)
      r.count.visible = r.label.visible && scene.graph.contribution
      r.count.scale.set(1 / scale)
      r.count.position.set(0, r.radius + (r.label.height * scale + 15) / scale)
    }
  }

  function paintPortrait(record, url) {
    if (record.portraitURL === url) return
    record.portraitURL = url
    record.portrait.visible = false
    record.icon.visible = true
    if (!url) return
    let pending = portraits.get(url)
    if (!pending) {
      pending = new Promise((resolve,reject) => {
        const image = new Image()
        image.onload = () => resolve(Texture.from(image))
        image.onerror = reject
        image.src = url
      })
      portraits.set(url,pending)
    }
    pending.then(texture => {
      if (destroyed || record.group.destroyed || record.portraitURL !== url) return
      record.portrait.texture = texture
      // Cover the circular node; the mask clips image corners beneath the rim.
      const fit = record.radius * 2 / Math.min(texture.width,texture.height)
      record.portrait.scale.set(fit)
      record.portrait.visible = true
      record.icon.visible = false
    }, () => { portraits.delete(url) })
  }

  function paintRim(r) {
    r.rim.clear()
    r.rimColor = r.node.id === selected ? colorFor(r.node.state) : palette('--text-secondary')
    const width = (r.node.id === selected ? 1.7 : 1.1) / camera.scale.x
    if (r.node.kind === 'scene')
      r.rim
        .poly([0, -r.radius, r.radius, 0, 0, r.radius, -r.radius, 0])
        .fill(palette('--surface-raised'))
        .stroke({ color: r.rimColor, width })
    else r.rim.circle(0, 0, r.radius).stroke({ color: r.rimColor, width, alpha: 1 })
  }
  function buildNode(node) {
    const radius =
      node.kind === 'scene' ? 30 : (nodeSize(node) * (scene.kind === 'all' ? 0.7 : 1)) / 2
    const group = new Container({ x: node.x, y: node.y, eventMode: 'static', cursor: 'pointer' })
    const hitRadius = Math.max(radius + 12, 28)
    group.hitArea = new Rectangle(-hitRadius, -hitRadius, hitRadius * 2, hitRadius * 2)
    group.accessible = true
    group.accessibleType = 'button'
    group.tabIndex = 0
    group.accessiblePointerEvents = 'none'
    group.accessibleTitle = `${node.kind}: ${node.label}. ${node.kind === 'scene' ? `Scene ${node.number}` : `${node.raw.scene_count} ${node.raw.scene_count === 1 ? 'scene' : 'scenes'}`}. ${stateLabel[node.state] ?? node.state}`
    const body = new Sprite(orb)
    body.anchor.set(0.5)
    body.width = body.height = radius * 1.72
    const rim = new Graphics(),
      reticle = new Graphics()
    body.visible = node.kind !== 'scene'
    const icon = new Text({
      text: node.kind === 'scene' ? String(node.number).padStart(2, '0') : fonts[node.kind].text,
      style: {
        fontFamily: node.kind === 'scene' ? 'system-ui' : fonts[node.kind].fontFamily,
        fontSize: node.kind === 'scene' ? 22 : Math.max(24, radius * 0.55),
        fill: palette('--text-primary'),
        fontWeight: '300',
      },
    })
    icon.anchor.set(0.5)
    icon.alpha = 0.85
    const label = new Text({
      text: node.label,
      style: {
        fontFamily: 'system-ui',
        fontSize: 12,
        fill: palette('--text-primary'),
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 110,
        breakWords: true,
        lineHeight: 16,
      },
    })
    label.anchor.set(0.5, 0)
    const count = new Text({
      text: `${node.raw.scene_count} ${node.raw.scene_count === 1 ? 'scene' : 'scenes'}`,
      style: { fontFamily: 'system-ui', fontSize: 11, fill: palette('--text-secondary') },
    })
    count.anchor.set(0.5, 0)
    const portrait = new Sprite()
    portrait.anchor.set(0.5)
    portrait.visible = false
    const portraitMask = new Graphics().circle(0, 0, radius).fill(0xffffff)
    group.addChild(body, portrait, portraitMask, rim, reticle, icon, label, count)
    portrait.mask = portraitMask
    onTap(group, () => {
      const now = performance.now()
      callbacks.onSelect(node.id)
      if (lastTap.id === node.id && now - lastTap.at < 350) focus(node.id)
      lastTap = { id: node.id, at: now }
    })
    group.on('pointerover', () => {
      hovered = node.id
      callbacks.onHover(node.id)
      refresh()
    })
    group.on('pointerout', () => {
      hovered = ''
      callbacks.onHover('')
      refresh()
    })
    group.on('mouseover', () => {
      hovered = node.id
      callbacks.onHover(node.id)
      refresh()
    })
    group.on('mouseout', () => {
      hovered = ''
      callbacks.onHover('')
      refresh()
    })
    bodies.addChild(group)
    records.push({ node, group, body, rim, reticle, radius, label, count, icon, portrait, portraitURL: undefined })
  }
  bodies.sortableChildren = true

  function update(next) {
    if (destroyed) return
    const layoutChanged = !scene || scene.kind !== next.kind || scene.variant !== next.variant
    const previousEdge = scene?.selectedEdge
    const previousSelected = selected
    const reset = scene && scene.cameraKey !== next.cameraKey
    scene = next
    selected = next.selectedId
    related = next.related
    const nextSignature =
      `${next.kind}:${next.variant}:` +
      next.graph.nodes.map((n) => `${n.id}:${n.x}:${n.y}:${n.size}`).join('|')
    if (signature !== nextSignature) {
      const first = !signature
      signature = nextSignature
      const previous = new Map(records.filter((r) => !r.exiting).map((r) => [r.node.id, r]))
      for (const r of records) {
        r.exiting = true
        r.group.eventMode = 'none'
        r.group.accessible = false
      }
      for (const node of next.graph.nodes) {
        buildNode(node)
        const r = records.at(-1),
          old = previous.get(node.id)
        r.from = { x: old?.group.x ?? camera.center.x, y: old?.group.y ?? camera.center.y }
        r.group.position.set(r.from.x, r.from.y)
        r.fromAlpha = old?.group.alpha ?? 0
        r.group.alpha = r.fromAlpha
        if (old) {
          old.group.destroy({ children: true })
          records.splice(records.indexOf(old), 1)
        }
      }
      motionStart = first || reducedMotion ? 0 : performance.now()
      for (const r of records) if (r.exiting) r.fromAlpha = r.group.alpha
      if (!motionStart) {
        for (const r of records) if (!r.exiting) r.group.position.set(r.node.x, r.node.y)
        for (const r of records.filter((r) => r.exiting)) r.group.destroy({ children: true })
        records = records.filter((r) => !r.exiting)
      }
      drawClusters(true)
      if (first || layoutChanged) fit(!first)
      else camera.resize(app.screen.width, app.screen.height, next.graph.width, next.graph.height)
    }
    const byId = new Map(next.graph.nodes.map((n) => [n.id, n]))
    for (const record of records) {
      const node = byId.get(record.node.id)
      if (node) {
        record.node = node
        paintPortrait(record,next.portraits?.[node.id] ?? '')
        record.group.accessibleTitle = node.label
        record.count.text = `${node.raw.scene_count} ${node.raw.scene_count === 1 ? 'scene' : 'scenes'}`
      }
    }
    if (next.selectedEdge && edgeKey(next.selectedEdge) !== edgeKey(previousEdge)) focusEdge(next.selectedEdge)
    else if (reset) fit()
    else if (previousSelected !== selected && signature === nextSignature) {
      if (selected) focus(selected, 1.35)
      else fit()
    }
    refresh()
  }
  camera.on('moved', updateLabels)
  camera.on('zoomed', () => {
    updateLabels()
    drawLines()
    drawClusters()
    for (const r of records) paintRim(r)
  })
  const observer = new ResizeObserver(() => {
    app.renderer.resize(Math.max(1, element.clientWidth), Math.max(1, element.clientHeight))
    fit(false)
    updateLabels()
  })
  observer.observe(element)
  const themeObserver = new MutationObserver(() => refresh())
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class'],
  })
  app.ticker.add(() => {
    frames++
    const now = performance.now()
    if (motionStart) {
      const t = Math.min(1, (now - motionStart) / 650)
      const ease = (1 - Math.cos(Math.PI * t)) / 2
      for (const r of records) {
        if (!r.exiting)
          r.group.position.set(
            r.from.x + (r.node.x - r.from.x) * ease,
            r.from.y + (r.node.y - r.from.y) * ease,
          )
        r.group.alpha = r.fromAlpha + (r.targetAlpha - r.fromAlpha) * ease
      }
      drawLines()
      updateLabels()
      if (t === 1) {
        motionStart = 0
        for (const r of records.filter((r) => r.exiting)) r.group.destroy({ children: true })
        records = records.filter((r) => !r.exiting)
      }
    }
    element.dataset.camera = JSON.stringify({
      x: camera.center.x,
      y: camera.center.y,
      scale: camera.scale.x,
    })
    element.dataset.moving = String(!!motionStart || !!camera.plugins.get('animate'))
    if (now - sampleStart > 750) {
      callbacks.onStats({
        fps: Math.round((frames * 1000) / (now - sampleStart)),
        zoom: Math.round(camera.scale.x * 100),
        nodes: records.length,
      })
      frames = 0
      sampleStart = now
    }
  })
  return {
    update,
    setActive(active) {
      accessibility.inert = !active
      accessibility.style.display = active ? '' : 'none'
      if (active) app.ticker.start()
      else app.ticker.stop()
    },
    focus,
    fit,
    zoom: (factor) =>
      camera.animate({
        scale: Math.min(3, Math.max(fitScale * 0.3, camera.scale.x * factor)),
        time: reducedMotion ? 0 : 200,
        removeOnInterrupt: true,
      }),
    destroy() {
      if (destroyed) return
      destroyed = true
      app.ticker.stop()
      observer.disconnect()
      themeObserver.disconnect()
      // Viewport removes its ticker listener during destruction. It must go before
      // Application destroys that ticker (Pixi TickerPlugin precedes stage cleanup).
      camera.destroy({ children: true })
      app.destroy(true, { children: true })
      orb.destroy(true)
      for (const pending of portraits.values()) pending.then(texture => texture.destroy(true), () => {})
      portraits.clear()
    },
  }
}
