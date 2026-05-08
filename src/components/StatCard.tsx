interface Props {
  label: string
  value: string | number
  unit?: string
  color?: string
  icon?: string
  sub?: string
}

export default function StatCard({ label, value, unit, color = '#00d4ff', icon, sub }: Props) {
  return (
    <div className="panel-bg cyber-border rounded-lg p-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold stat-value" style={{ color }}>
          {typeof value === 'number' ? value.toFixed(value % 1 === 0 ? 0 : 1) : value}
        </span>
        {unit && <span className="text-[11px] text-slate-500">{unit}</span>}
      </div>
      {sub && <div className="text-[10px] text-slate-600">{sub}</div>}
    </div>
  )
}
