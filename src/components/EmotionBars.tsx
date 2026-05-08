import type { ExpressionScores } from '../types/face'
import { getEmotionTR, getEmotionColor } from '../utils/faceUtils'

interface Props {
  expressions: ExpressionScores
}

const ORDER: (keyof ExpressionScores)[] = [
  'happy', 'neutral', 'surprised', 'sad', 'angry', 'fearful', 'disgusted'
]

export default function EmotionBars({ expressions }: Props) {
  return (
    <div className="space-y-2">
      {ORDER.map(key => {
        const value = expressions[key] ?? 0
        const pct = Math.round(value * 100)
        const color = getEmotionColor(key)
        return (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 w-16 shrink-0">{getEmotionTR(key)}</span>
            <div className="flex-1 h-4 bg-slate-800/60 rounded-sm overflow-hidden relative">
              <div
                className="h-full rounded-sm relative overflow-hidden shimmer-bar transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: color + '99', minWidth: pct > 0 ? 4 : 0 }}
              />
            </div>
            <span
              className="text-[11px] font-bold w-8 text-right stat-value"
              style={{ color }}
            >
              {pct}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
