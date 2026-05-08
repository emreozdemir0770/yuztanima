import type { OverlaySettings } from '../types/face'

interface Props {
  settings: OverlaySettings
  onChange: (s: OverlaySettings) => void
}

const CONTROLS: { key: keyof OverlaySettings; label: string; icon: string }[] = [
  { key: 'showBox', label: 'Çerçeve', icon: '⬜' },
  { key: 'showLandmarks', label: 'Noktalar', icon: '⁘' },
  { key: 'showSymmetryAxis', label: 'Simetri', icon: '⟺' },
  { key: 'showLabel', label: 'Etiket', icon: '🏷' },
]

export default function OverlayControls({ settings, onChange }: Props) {
  const toggle = (key: keyof OverlaySettings) =>
    onChange({ ...settings, [key]: !settings[key] })

  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-slate-600 uppercase tracking-widest mr-1">Katmanlar</span>
      {CONTROLS.map(c => (
        <button
          key={c.key}
          onClick={() => toggle(c.key)}
          title={c.label}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold tracking-wide transition-all duration-150
            ${settings[c.key]
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'bg-transparent text-slate-600 border border-slate-800 hover:text-slate-400'
            }`}
        >
          <span>{c.icon}</span>
          <span className="hidden sm:inline">{c.label}</span>
        </button>
      ))}
    </div>
  )
}
