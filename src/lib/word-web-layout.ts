/**
 * Radial layout for the vocabulary Word Web.
 *
 * Words of the same relation type are kept in one contiguous sector (the way
 * visual thesauruses group by relation), each sector gets an angular budget
 * proportional to how much label width it needs, wide sectors are split across
 * two rings, and a final relaxation pass separates any pills that still touch.
 * Everything is deterministic so the layout can be asserted in tests and stays
 * stable between renders.
 */

export interface WordWebGroup {
  key: string
  label: string
  words: string[]
}

export interface WordWebNode {
  word: string
  groupKey: string
  groupLabel: string
  x: number
  y: number
  width: number
  height: number
  /** Connector clipped to the hub edge and the pill edge, so no line runs under a label. */
  edge: { x1: number; y1: number; x2: number; y2: number }
}

export interface WordWebLayout {
  nodes: WordWebNode[]
  hub: { x: number; y: number; rx: number; ry: number }
  viewBox: string
  width: number
  height: number
}

const NODE_HEIGHT = 28
const NODE_PAD_X = 26
const CHAR_WIDTH = 7.3
const MIN_NODE_WIDTH = 56
const GROUP_GAP_DEG = 12
const RING_GAP = 38
const HUB_RY = 40
const HUB_CLEARANCE = 26
const CANVAS_PAD = 16
const GAP_X = 12
const GAP_Y = 10
const RELAX_ITERATIONS = 240

export function measureNodeWidth(word: string): number {
  return Math.max(MIN_NODE_WIDTH, Math.round(word.length * CHAR_WIDTH + NODE_PAD_X))
}

function measureHub(word: string, chinese: string) {
  const wordWidth = word.length * 9.2
  const chineseWidth = chinese.length * 11.5
  const rx = Math.max(44, wordWidth / 2 + 18, chineseWidth / 2 + 16)
  return { rx, ry: HUB_RY }
}

/** Distance from an ellipse centre to its edge along the unit vector (dx, dy). */
function ellipseEdge(rx: number, ry: number, dx: number, dy: number): number {
  const denom = Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
  return denom === 0 ? rx : 1 / denom
}

/** Distance from a rect centre to its edge along the unit vector (dx, dy). */
function rectEdge(width: number, height: number, dx: number, dy: number): number {
  const tx = dx === 0 ? Number.POSITIVE_INFINITY : Math.abs(width / 2 / dx)
  const ty = dy === 0 ? Number.POSITIVE_INFINITY : Math.abs(height / 2 / dy)
  return Math.min(tx, ty)
}

interface Placed extends Omit<WordWebNode, 'edge'> {}

export function layoutWordWeb(
  word: string,
  chinese: string,
  groups: WordWebGroup[]
): WordWebLayout | null {
  const usable = groups.filter((g) => g.words.length > 0)
  const total = usable.reduce((sum, g) => sum + g.words.length, 0)
  const hub = { x: 0, y: 0, ...measureHub(word, chinese) }
  if (total === 0) return null

  const baseRadius =
    Math.max(hub.rx, hub.ry) + HUB_CLEARANCE + NODE_HEIGHT + Math.max(0, total - 8) * 5

  // Angular budget per group, weighted by the label width it has to fit.
  const weights = usable.map((g) =>
    g.words.reduce((sum, w) => sum + measureNodeWidth(w) + GAP_X, 0)
  )
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const arcTotal = 360 - GROUP_GAP_DEG * usable.length

  const placed: Placed[] = []
  let cursor = -90 + GROUP_GAP_DEG / 2

  usable.forEach((group, gi) => {
    const arc = (weights[gi] / weightSum) * arcTotal
    const capacity = ((arc * Math.PI) / 180) * baseRadius
    const rings = weights[gi] > capacity ? 2 : 1
    const step = arc / group.words.length

    group.words.forEach((w, i) => {
      // Alternate rings so neighbouring pills never share the same orbit.
      const radius = baseRadius + (i % rings) * RING_GAP
      const angle = ((cursor + step * (i + 0.5)) * Math.PI) / 180
      placed.push({
        word: w,
        groupKey: group.key,
        groupLabel: group.label,
        x: hub.x + radius * Math.cos(angle),
        y: hub.y + radius * Math.sin(angle),
        width: measureNodeWidth(w),
        height: NODE_HEIGHT,
      })
    })

    cursor += arc + GROUP_GAP_DEG
  })

  relax(placed, hub)

  const nodes: WordWebNode[] = placed.map((node) => ({ ...node, edge: connector(node, hub) }))

  let minX = hub.x - hub.rx
  let maxX = hub.x + hub.rx
  let minY = hub.y - hub.ry
  let maxY = hub.y + hub.ry
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.width / 2)
    maxX = Math.max(maxX, n.x + n.width / 2)
    minY = Math.min(minY, n.y - n.height / 2)
    maxY = Math.max(maxY, n.y + n.height / 2)
  }

  const width = Math.round(maxX - minX + CANVAS_PAD * 2)
  const height = Math.round(maxY - minY + CANVAS_PAD * 2)
  const originX = Math.round(minX - CANVAS_PAD)
  const originY = Math.round(minY - CANVAS_PAD)

  return { nodes, hub, viewBox: `${originX} ${originY} ${width} ${height}`, width, height }
}

/** Iteratively pushes overlapping pills apart and keeps them clear of the hub. */
function relax(nodes: Placed[], hub: { x: number; y: number; rx: number; ry: number }) {
  for (let iteration = 0; iteration < RELAX_ITERATIONS; iteration++) {
    let moved = false

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]
        const b = nodes[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const overlapX = (a.width + b.width) / 2 + GAP_X - Math.abs(dx)
        const overlapY = (a.height + b.height) / 2 + GAP_Y - Math.abs(dy)
        if (overlapX <= 0 || overlapY <= 0) continue

        moved = true
        // Resolve on the axis of least penetration — the smaller visual shift.
        if (overlapX < overlapY) {
          const shift = (overlapX / 2) * (dx >= 0 ? 1 : -1)
          a.x -= shift
          b.x += shift
        } else {
          const shift = (overlapY / 2) * (dy >= 0 ? 1 : -1)
          a.y -= shift
          b.y += shift
        }
      }
    }

    for (const node of nodes) {
      let dx = node.x - hub.x
      let dy = node.y - hub.y
      let dist = Math.hypot(dx, dy)
      if (dist < 0.001) {
        dx = 0
        dy = 1
        dist = 1
      }
      const ux = dx / dist
      const uy = dy / dist
      const required =
        ellipseEdge(hub.rx, hub.ry, ux, uy) + rectEdge(node.width, node.height, ux, uy) + GAP_Y
      if (dist < required) {
        node.x = hub.x + ux * required
        node.y = hub.y + uy * required
        moved = true
      }
    }

    if (!moved) break
  }
}

function connector(node: Placed, hub: { x: number; y: number; rx: number; ry: number }) {
  const dx = node.x - hub.x
  const dy = node.y - hub.y
  const dist = Math.hypot(dx, dy) || 1
  const ux = dx / dist
  const uy = dy / dist
  const start = ellipseEdge(hub.rx, hub.ry, ux, uy)
  const end = dist - rectEdge(node.width, node.height, ux, uy)
  return {
    x1: hub.x + ux * start,
    y1: hub.y + uy * start,
    x2: hub.x + ux * Math.max(start, end),
    y2: hub.y + uy * Math.max(start, end),
  }
}

/** True when two laid-out pills visually collide — used by tests. */
export function nodesOverlap(a: WordWebNode, b: WordWebNode): boolean {
  return (
    Math.abs(a.x - b.x) < (a.width + b.width) / 2 && Math.abs(a.y - b.y) < (a.height + b.height) / 2
  )
}
