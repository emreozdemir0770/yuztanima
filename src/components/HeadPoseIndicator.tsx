import type { HeadPose } from '../types/face'

interface Props {
  pose: HeadPose
}

function Gauge({ label, value, min = -45, max = 45, color }: {
  label: string; value: number; min?: number; max?: number; color: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  const clamped = Math.max(0, Math.min(100, pct))

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[9px] text-slate-500">
        <span>{label}</span>
        <span style={{ color }} className="font-bold stat-value">{value.toFixed(1)}°</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full relative overflow-hidden">
        {/* Center mark */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-600 z-10" />
        {/* Indicator */}
        <div
          className="absolute top-0 h-full w-1.5 rounded-full transition-all duration-150"
          style={{ left: `calc(${clamped}% - 3px)`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function HeadPoseIndicator({ pose }: Props) {
  return (
    <div className="space-y-2">
      <Gauge label="Yukarı/Aşağı (Pitch)" value={pose.pitch} color="#00ff9d" />
      <Gauge label="Sağ/Sol (Yaw)" value={pose.yaw} color="#7b2fff" />
      <Gauge label="Eğim (Roll)" value={pose.roll} min={-30} max={30} color="#ffcc00" />
    </div>
  )
}
