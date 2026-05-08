import type { TrackedFace } from '../types/face'
import { getDominantEmotion, getGenderTR } from '../utils/faceUtils'

interface Props {
  faces: TrackedFace[]
}

export default function MultiFaceBar({ faces }: Props) {
  if (faces.length <= 1) return null

  return (
    <div className="panel-bg cyber-border rounded-xl p-3 shrink-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] uppercase tracking-widest text-slate-500">
          Tespit Edilen Yüzler ({faces.length})
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {faces.map(face => (
          <div
            key={face.index}
            className="shrink-0 rounded-lg p-2.5 border flex flex-col gap-1 min-w-[120px]"
            style={{ borderColor: face.color + '44', backgroundColor: face.color + '0a' }}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: face.color }} />
              <span className="text-[10px] font-bold" style={{ color: face.color }}>
                Yüz #{face.index + 1}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <Stat label="Yaş" value={`${face.age}`} color={face.color} />
              <Stat label="Cin." value={getGenderTR(face.gender)[0]} color={face.color} />
              <Stat label="Duygu" value={getDominantEmotion(face.expressions as unknown as Record<string,number>).slice(0,6)} color={face.color} />
              <Stat label="Sim." value={`%${Math.round(face.symmetryScore)}`} color={face.color} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="text-[8px] text-slate-600">{label}</div>
      <div className="text-[10px] font-bold stat-value" style={{ color }}>{value}</div>
    </div>
  )
}
