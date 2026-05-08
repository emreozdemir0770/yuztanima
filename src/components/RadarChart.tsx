interface Metric {
  label: string
  value: number
  max?: number
  color: string
}

interface Props {
  metrics: Metric[]
  size?: number
}

export default function RadarChart({ metrics, size = 140 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 20
  const n = metrics.length

  const angleFor = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const pointAt = (i: number, ratio: number) => {
    const a = angleFor(i)
    return { x: cx + Math.cos(a) * r * ratio, y: cy + Math.sin(a) * r * ratio }
  }

  const dataPoints = metrics.map((m, i) => pointAt(i, Math.min(1, (m.value / (m.max ?? 100)))))
  const polyline = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid circles */}
      {gridLevels.map(lvl => (
        <polygon
          key={lvl}
          points={Array.from({ length: n }, (_, i) => {
            const p = pointAt(i, lvl)
            return `${p.x},${p.y}`
          }).join(' ')}
          fill="none"
          stroke="#1a2744"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {metrics.map((_, i) => {
        const p = pointAt(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#1a2744" strokeWidth="1" />
      })}

      {/* Data area */}
      <polygon
        points={polyline}
        fill="#00d4ff22"
        stroke="#00d4ff"
        strokeWidth="1.5"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={metrics[i].color} />
      ))}

      {/* Labels */}
      {metrics.map((m, i) => {
        const a = angleFor(i)
        const labelR = r + 14
        const lx = cx + Math.cos(a) * labelR
        const ly = cy + Math.sin(a) * labelR
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fill="#64748b"
          >
            {m.label}
          </text>
        )
      })}
    </svg>
  )
}
