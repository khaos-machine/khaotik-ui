// Story Atlas: moved from Khaos App's src/ui/atlas/drawing.js (catalog app-coverage plan, T7).
import { Texture } from 'pixi.js'
import { icons } from './appearance.js'
export function texture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas textures are unavailable')
  ctx.fillStyle = 'white' // Neutral alpha mask; displayed color comes from the theme tint.
  ctx.beginPath()
  ctx.arc(128, 128, 127, 0, Math.PI * 2)
  ctx.fill()
  return Texture.from(canvas)
}

export function iconFont(kind) {
  const probe = document.createElement('i')
  probe.className = `ph ph-${icons[kind]}`
  probe.style.display = 'none'
  probe.setAttribute('aria-hidden', 'true')
  document.body.append(probe)
  const style = getComputedStyle(probe, '::before')
  const result = { text: style.content.slice(1, -1), fontFamily: style.fontFamily }
  probe.remove()
  return result
}

export function dashed(g, a, b, color, alpha, width = 1) {
  const distance = Math.hypot(b.x - a.x, b.y - a.y)
  for (let start = 0; start < distance; start += 15) {
    const end = Math.min(start + 5, distance)
    g.moveTo(a.x + ((b.x - a.x) * start) / distance, a.y + ((b.y - a.y) * start) / distance)
      .lineTo(a.x + ((b.x - a.x) * end) / distance, a.y + ((b.y - a.y) * end) / distance)
      .stroke({ color, alpha, width })
  }
}

export function onTap(target, action) {
  let origin = null
  target.on('pointerdown', (event) => {
    origin = event.global ? { x: event.global.x, y: event.global.y } : null
  })
  target.on('pointertap', (event) => {
    if (
      origin &&
      event.global &&
      Math.hypot(event.global.x - origin.x, event.global.y - origin.y) > 8
    )
      return
    action()
  })
}
export function createLabelFitter() {
  const textMeasure = document.createElement('canvas').getContext('2d')
  const labelCache = new Map()
  function compactLabel(text, width, weight, maxLines = 2) {
    const key = `${text}:${Math.round(width)}:${weight}:${maxLines}`
    if (labelCache.has(key)) return labelCache.get(key)
    textMeasure.font = `${weight} 12px system-ui`
    const words = text.split(/\s+/),
      lines = []
    let line = ''
    while (words.length && lines.length < maxLines) {
      const word = words[0],
        candidate = line ? `${line} ${word}` : word
      if (textMeasure.measureText(candidate).width <= width || !line) {
        line = candidate
        words.shift()
      } else {
        lines.push(line)
        line = ''
      }
    }
    if (line && lines.length < maxLines) lines.push(line)
    if (words.length || lines.some((value) => textMeasure.measureText(value).width > width)) {
      let last = lines.at(-1) ?? ''
      while (last && textMeasure.measureText(last + '…').width > width) last = last.slice(0, -1)
      lines[lines.length - 1] = last.trimEnd() + '…'
    }
    const result = lines.join('\n')
    labelCache.set(key, result)
    return result
  }
  return compactLabel
}
