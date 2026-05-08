import type { DetectedCreature } from '../hooks/useCreatureDetection'
import type { BioTaxonomy } from '../utils/taxonomy'
import { getClassColor } from '../utils/taxonomy'

interface Props {
  creatures: DetectedCreature[]
  creaturesLoaded: boolean
}

function TaxonomyTree({ t, color }: { t: BioTaxonomy; color: string }) {
  const levels = [
    { rank: 'Alem', value: t.kingdom },
    { rank: 'Şube', value: t.phylum },
    { rank: 'Sınıf', value: `${t.class} (${t.classTR})` },
    { rank: 'Takım', value: `${t.order} (${t.orderTR})` },
    { rank: 'Aile', value: `${t.family} (${t.familyTR})`, highlight: true },
    ...(t.genus ? [{ rank: 'Cins', value: t.genus }] : []),
    ...(t.binomial ? [{ rank: 'Tür', value: t.binomial, italic: true }] : []),
  ]

  return (
    <div className="space-y-0.5">
      {levels.map((lvl, i) => (
        <div key={i} className="flex items-start gap-1.5" style={{ paddingLeft: `${i * 8}px` }}>
          <span className="text-[8px] text-slate-600 mt-0.5 shrink-0">└</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[8px] text-slate-600 shrink-0 w-8">{lvl.rank}</span>
            <span
              className={`text-[9px] font-medium ${lvl.highlight ? 'font-bold' : ''}`}
              style={{
                color: lvl.highlight ? color : '#94a3b8',
                fontStyle: (lvl as { italic?: boolean }).italic ? 'italic' : 'normal',
              }}
            >
              {lvl.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ConfidenceBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.round(score * 100)}%`, backgroundColor: color + 'cc' }} />
      </div>
      <span className="text-[9px] font-bold stat-value" style={{ color }}>
        %{Math.round(score * 100)}
      </span>
    </div>
  )
}

function CreatureCard({ creature }: { creature: DetectedCreature }) {
  const t = creature.taxonomy
  const color = t ? getClassColor(t.class) : '#94a3b8'
  const label = t?.commonNameTR ?? creature.label

  // Shorten mobilenet label for display
  const mnetShort = creature.mobileNetLabel
    .replace(/^n\d+ /, '')
    .split(',')[0]
    .split(' ')
    .slice(0, 3)
    .join(' ')

  return (
    <div
      className="rounded-xl p-4 border space-y-3"
      style={{ borderColor: color + '33', backgroundColor: color + '08' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{t?.emoji ?? '🔍'}</span>
          <div>
            <div className="text-sm font-bold" style={{ color }}>{label}</div>
            {t?.binomial && (
              <div className="text-[9px] text-slate-500 italic">{t.binomial}</div>
            )}
          </div>
        </div>
        <div
          className="text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0"
          style={{ color, borderColor: color + '44', backgroundColor: color + '15' }}
        >
          {t?.classTR ?? 'Bilinmiyor'}
        </div>
      </div>

      {/* Confidence */}
      <div>
        <div className="text-[8px] text-slate-600 mb-1">Tespit Güveni</div>
        <ConfidenceBar score={creature.score} color={color} />
      </div>

      {/* MobileNet refinement */}
      {mnetShort !== creature.label && (
        <div className="text-[8px] text-slate-600">
          AI Sınıflandırma: <span className="text-slate-400">{mnetShort}</span>
        </div>
      )}

      {/* Description */}
      {t?.description && (
        <p className="text-[9px] text-slate-500 leading-relaxed">{t.description}</p>
      )}

      {/* Taxonomy Tree */}
      {t && (
        <div className="border-t border-slate-800/50 pt-2">
          <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-2">
            Biyolojik Sınıflandırma
          </div>
          <TaxonomyTree t={t} color={color} />
        </div>
      )}
    </div>
  )
}

export default function CreaturePanel({ creatures, creaturesLoaded }: Props) {
  if (!creaturesLoaded) {
    return (
      <div className="panel-bg cyber-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 rounded-full bg-yellow-400" />
          <span className="text-[11px] uppercase tracking-widest text-slate-400">Canlı Tespiti</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-yellow-400">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 pulsing-dot" />
          COCO-SSD & MobileNet yükleniyor...
        </div>
      </div>
    )
  }

  if (creatures.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-yellow-400" />
        <span className="text-[11px] uppercase tracking-widest text-slate-400">
          Canlı Tespiti ({creatures.length})
        </span>
      </div>
      {creatures.map(c => (
        <CreatureCard key={c.id} creature={c} />
      ))}
    </div>
  )
}
