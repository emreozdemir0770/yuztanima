import { useMemo } from 'react'
import type { ExpressionScores } from '../types/face'
import { getEmotionColor, getEmotionTR } from '../utils/faceUtils'

interface Props {
  history: ExpressionScores[]
  width?: number
  height?: number
}

const EMOTIONS: (keyof ExpressionScores)[] = ['happy', 'neutral', 'sad', 'angry', 'surprised', 'fearful', 'disgusted']

export default function EmotionTimeline({ history, width = 260, height = 100 }: Props) {
  const padded = useMemo(() => {
    const empty: ExpressionScores = { happy: 0, neutral: 0, sad: 0, angry: 0, fearful: 0, disgusted: 0, surprised: 0 }
    if (history.length >= 2) return history
    return [...Array(2 - history.length).fill(empty), ...history]
  }, [history])

  const n = padded.length
  const px = (i: number) => (i / (n - 1)) * width
  const py = (v: number) => height - v * height

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-700 text-[10px]" style={{ height }}>
        Kamera başlatıldığında grafik oluşacak
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(lvl => (
          <line key={lvl}
            x1={0} y1={py(lvl)} x2={width} y2={py(lvl)}
            stroke="#1a2744" strokeWidth="1" strokeDasharray="3,3" />
        ))}

        {/* Emotion lines */}
        {EMOTIONS.map(key => {
          const color = getEmotionColor(key)
          const d = padded.map((entry, i) =>
            `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(entry[key]).toFixed(1)}`
          ).join(' ')
          return (
            <path key={key} d={d} fill="none" stroke={color} strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
          )
        })}

        {/* Latest value dots */}
        {EMOTIONS.map(key => {
          const last = padded[padded.length - 1]
          const color = getEmotionColor(key)
          return (
            <circle key={key}
              cx={width} cy={py(last[key])} r="2.5"
              fill={color} stroke="#0a0e1a" strokeWidth="1" />
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-2 gap-y-0.5">
        {EMOTIONS.map(key => {
          const last = history.length > 0 ? history[history.length - 1] : null
          const val = last ? Math.round(last[key] * 100) : 0
          const color = getEmotionColor(key)
          return (
            <div key={key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[8px] text-slate-500">{getEmotionTR(key)}</span>
              <span className="text-[8px] font-bold stat-value" style={{ color }}>{val}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
