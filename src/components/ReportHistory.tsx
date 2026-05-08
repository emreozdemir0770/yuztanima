import { useEffect, useState, useCallback } from 'react'
import { getAllReports, deleteReport, clearAllReports, type FaceReport } from '../db/faceDB'
import { getGenderTR, getEmotionTR, getEmotionColor, getDominantEmotion } from '../utils/faceUtils'
import { getClassColor } from '../utils/taxonomy'
import type { ExpressionScores } from '../types/face'
import type { DetectedCreature } from '../hooks/useCreatureDetection'
import type { BioTaxonomy } from '../utils/taxonomy'
import ReportModal from './ReportModal'

interface Props {
  open: boolean
  onClose: () => void
  refreshKey: number
}

export default function ReportHistory({ open, onClose, refreshKey }: Props) {
  const [reports, setReports] = useState<FaceReport[]>([])
  const [selected, setSelected] = useState<FaceReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setReports(await getAllReports())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, refreshKey, load])

  const handleDelete = async (id: number) => {
    await deleteReport(id)
    setSelected(null)
    load()
  }

  const handleClearAll = async () => {
    await clearAllReports()
    setConfirmClear(false)
    load()
  }

  const exportJSON = () => {
    const json = JSON.stringify(reports.map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      date: new Date(r.timestamp).toISOString(),
      analysisMode: r.analysisMode,
      overallScore: r.overallScore,
      age: r.result.age,
      gender: r.result.gender,
      genderProbability: r.result.genderProbability,
      faceShape: r.result.faceShape,
      symmetryScore: r.result.symmetryScore,
      goldenRatioScore: r.result.goldenRatioScore,
      headPose: r.result.headPose,
      expressions: r.result.expressions,
      insights: r.insights,
    })), null, 2)
    download('faceanalyzer-raporlar.json', 'application/json', json)
  }

  const exportCSV = () => {
    const headers = ['id','tarih','mod','skor','yas','cinsiyet','cinsiyet_guven','yuz_sekli','simetri','altin_oran','pitch','yaw','roll']
    const rows = reports.map(r => [
      r.id,
      new Date(r.timestamp).toISOString(),
      r.analysisMode,
      r.overallScore.toFixed(1),
      r.result.age,
      r.result.gender,
      (r.result.genderProbability * 100).toFixed(1),
      r.result.faceShape,
      r.result.symmetryScore.toFixed(1),
      r.result.goldenRatioScore.toFixed(1),
      r.result.headPose.pitch.toFixed(1),
      r.result.headPose.yaw.toFixed(1),
      r.result.headPose.roll.toFixed(1),
    ].join(','))
    download('faceanalyzer-raporlar.csv', 'text/csv', [headers.join(','), ...rows].join('\n'))
  }

  function download(filename: string, type: string, content: string) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[80] flex"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Drawer */}
        <div className="relative ml-auto w-[420px] h-full bg-[#0d1425] border-l border-[#1a2744] flex flex-col shadow-2xl z-10">
          {/* Header */}
          <div className="border-b border-[#1a2744] px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <div className="text-[9px] text-slate-600 tracking-widest uppercase mb-0.5">Veritabanı</div>
              <h3 className="text-sm font-bold text-cyan-400 tracking-wide">Kayıtlı Raporlar</h3>
            </div>
            <div className="flex items-center gap-1.5">
              {reports.length > 0 && (
                <>
                  <button onClick={exportJSON} title="JSON olarak indir"
                    className="px-2.5 py-1 text-[10px] rounded border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-900/60 transition-all">
                    ↓ JSON
                  </button>
                  <button onClick={exportCSV} title="CSV olarak indir"
                    className="px-2.5 py-1 text-[10px] rounded border border-slate-700 text-slate-400 hover:text-green-400 hover:border-green-900/60 transition-all">
                    ↓ CSV
                  </button>
                  {confirmClear ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-red-400">Emin?</span>
                      <button onClick={handleClearAll}
                        className="px-2 py-1 text-[10px] rounded border border-red-700 text-red-400 hover:bg-red-900/20">Evet</button>
                      <button onClick={() => setConfirmClear(false)}
                        className="px-2 py-1 text-[10px] rounded border border-slate-700 text-slate-400">İptal</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmClear(true)}
                      className="px-2.5 py-1 text-[10px] rounded border border-red-800/40 text-red-500 hover:bg-red-900/20 transition-all">
                      Sil
                    </button>
                  )}
                </>
              )}
              <button onClick={onClose}
                className="px-2.5 py-1 text-[10px] rounded border border-slate-700 text-slate-400 hover:border-slate-500 transition-all">
                ✕
              </button>
            </div>
          </div>

          {/* Count */}
          <div className="px-5 py-2 border-b border-[#1a2744] shrink-0">
            <span className="text-[10px] text-slate-500">
              {loading ? 'Yükleniyor...' : `${reports.length} rapor kayıtlı`}
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!loading && reports.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-slate-700 text-xs space-y-2">
                <div className="text-2xl">◇</div>
                <p>Henüz kayıtlı rapor yok</p>
              </div>
            )}
            {reports.map(rep => (
              <ReportCard
                key={rep.id}
                report={rep}
                onClick={() => setSelected(rep)}
                onDelete={() => handleDelete(rep.id!)}
              />
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <ReportModal
          report={selected}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected.id!)}
        />
      )}
    </>
  )
}

const EMOTION_ORDER: (keyof ExpressionScores)[] = ['happy', 'neutral', 'surprised', 'sad', 'angry', 'fearful', 'disgusted']

function ScoreRing({ score }: { score: number }) {
  const size = 56
  const r = size / 2 - 6
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 85 ? '#00ff9d' : score >= 70 ? '#ffcc00' : '#ff6b35'
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a2744" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="12" fontWeight="bold" fill={color} fontFamily="monospace">{Math.round(score)}</text>
    </svg>
  )
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] text-slate-600 w-14 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.round(value)}%`, backgroundColor: color + 'cc' }} />
      </div>
      <span className="text-[8px] font-bold w-7 text-right" style={{ color }}>
        %{Math.round(value)}
      </span>
    </div>
  )
}

function ReportCard({ report, onClick, onDelete }: {
  report: FaceReport
  onClick: () => void
  onDelete: () => void
}) {
  const r = report.result
  const date = new Date(report.timestamp)
  const scoreColor = report.overallScore >= 85 ? '#00ff9d' : report.overallScore >= 70 ? '#ffcc00' : '#ff6b35'
  const dominantEmotion = getDominantEmotion(r.expressions as unknown as Record<string, number>)

  return (
    <div
      className="panel-bg cyber-border rounded-xl overflow-hidden cursor-pointer hover:border-cyan-900/60 transition-all group"
      onClick={onClick}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 p-3 border-b border-[#1a2744]/60">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/40 shrink-0">
          {report.imageSnapshot ? (
            <img src={report.imageSnapshot} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700 text-lg">◇</div>
          )}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-bold text-slate-300">Rapor #{report.id}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
              style={{ color: scoreColor, borderColor: scoreColor + '40', backgroundColor: scoreColor + '11' }}>
              {Math.round(report.overallScore)}/100
            </span>
          </div>
          <div className="text-[9px] text-slate-600 mb-1.5">
            {date.toLocaleDateString('tr-TR')} · {date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            <span className="ml-2 text-slate-700">{report.analysisMode === 'video' ? '📷' : '🖼'}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            <Tag label={`${r.age} yaş`} color="#00d4ff" />
            <Tag label={getGenderTR(r.gender)} color="#7b2fff" />
            <Tag label={r.faceShape} color="#00ff9d" />
            <Tag label={dominantEmotion} color="#ffcc00" />
          </div>
        </div>

        {/* Score ring */}
        <ScoreRing score={report.overallScore} />

        {/* Delete */}
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-red-400 text-xs shrink-0 self-start"
          onClick={e => { e.stopPropagation(); onDelete() }}
          title="Sil"
        >✕</button>
      </div>

      {/* Geometric metrics */}
      <div className="px-3 pt-2.5 pb-2 border-b border-[#1a2744]/40">
        <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1.5">Geometrik Analiz</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <MetricBar label="Simetri"
            value={r.symmetryScore}
            color={r.symmetryScore >= 85 ? '#00ff9d' : r.symmetryScore >= 75 ? '#ffcc00' : '#ff6b35'} />
          <MetricBar label="Altın Oran" value={r.goldenRatioScore} color="#ffcc00" />
          <MetricBar label="Sol Göz" value={r.eyeData.leftOpenness} color="#00d4ff" />
          <MetricBar label="Sağ Göz" value={r.eyeData.rightOpenness} color="#00d4ff" />
          <MetricBar label="Çene" value={r.jawline.sharpness} color="#ff6b35" />
          <MetricBar label="Cinsiyet Gvn." value={r.genderProbability * 100} color="#7b2fff" />
        </div>
      </div>

      {/* Emotion bars */}
      <div className="px-3 pt-2 pb-2 border-b border-[#1a2744]/40">
        <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1.5">Duygular</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {EMOTION_ORDER.map(key => {
            const val = (r.expressions as unknown as Record<string, number>)[key] ?? 0
            return (
              <MetricBar
                key={key}
                label={getEmotionTR(key)}
                value={val * 100}
                color={getEmotionColor(key)}
              />
            )
          })}
        </div>
      </div>

      {/* Head pose + measurements */}
      <div className="px-3 pt-2 pb-2 border-b border-[#1a2744]/40">
        <div className="grid grid-cols-2 gap-x-4">
          <div>
            <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1.5">Baş Pozisyonu</div>
            <div className="space-y-0.5">
              {[
                { label: 'Pitch', value: r.headPose.pitch, color: '#00ff9d' },
                { label: 'Yaw', value: r.headPose.yaw, color: '#7b2fff' },
                { label: 'Roll', value: r.headPose.roll, color: '#ffcc00' },
              ].map(p => (
                <div key={p.label} className="flex items-center justify-between">
                  <span className="text-[8px] text-slate-600">{p.label}</span>
                  <span className="text-[9px] font-bold stat-value" style={{ color: p.color }}>
                    {p.value.toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1.5">Ölçümler</div>
            <div className="space-y-0.5">
              {[
                { label: 'Gen.', value: `${Math.round(r.faceWidth)}px`, color: '#00d4ff' },
                { label: 'Yük.', value: `${Math.round(r.faceHeight)}px`, color: '#00d4ff' },
                { label: 'G.Mes.', value: `${Math.round(r.eyeData.interocularDistance)}px`, color: '#00d4ff' },
                { label: 'Çene∠', value: `${r.jawline.angle.toFixed(1)}°`, color: '#ff6b35' },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-[8px] text-slate-600">{m.label}</span>
                  <span className="text-[9px] font-bold stat-value" style={{ color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {report.insights.length > 0 && (
        <div className="px-3 pt-2 pb-2 border-b border-[#1a2744]/40">
          <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1.5">AI Tespitler</div>
          <ul className="space-y-0.5">
            {report.insights.map((ins, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[9px] text-slate-400">
                <span className="text-cyan-500 shrink-0 mt-0.5">›</span>
                <span className="leading-relaxed">{ins}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Biological classification */}
      {report.creatures && report.creatures.length > 0 && (
        <div className="px-3 pt-2 pb-3">
          <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-2">Biyolojik Sınıflandırma</div>
          <div className="space-y-3">
            {report.creatures.map(c => (
              <ReportTaxonomyCard key={c.id} creature={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[8px] px-1.5 py-0.5 rounded border font-medium"
      style={{ color, borderColor: color + '40', backgroundColor: color + '11' }}
    >
      {label}
    </span>
  )
}

function TaxonomyRow({ rank, value, indent, highlight, italic, color }: {
  rank: string; value: string; indent: number
  highlight?: boolean; italic?: boolean; color: string
}) {
  return (
    <div className="flex items-start gap-1.5" style={{ paddingLeft: `${indent * 10}px` }}>
      <span className="text-[8px] text-slate-700 mt-0.5 shrink-0">└</span>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-[8px] text-slate-600 shrink-0 w-10">{rank}</span>
        <span
          className={`text-[9px] ${highlight ? 'font-bold' : 'font-medium'} truncate`}
          style={{ color: highlight ? color : '#94a3b8', fontStyle: italic ? 'italic' : 'normal' }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

function ReportTaxonomyCard({ creature }: { creature: DetectedCreature }) {
  const t: BioTaxonomy | null = creature.taxonomy
  const color = t ? getClassColor(t.class) : '#94a3b8'
  const label = t?.commonNameTR ?? creature.label

  const rows = t ? [
    { rank: 'Alem', value: t.kingdom, indent: 0 },
    { rank: 'Şube', value: t.phylum, indent: 1 },
    { rank: 'Sınıf', value: `${t.class} (${t.classTR})`, indent: 2 },
    { rank: 'Takım', value: `${t.order} (${t.orderTR})`, indent: 3 },
    { rank: 'Aile', value: `${t.family} (${t.familyTR})`, indent: 4, highlight: true },
    ...(t.genus ? [{ rank: 'Cins', value: t.genus, indent: 5 }] : []),
    ...(t.binomial ? [{ rank: 'Tür', value: t.binomial, indent: 6, italic: true }] : []),
  ] : []

  return (
    <div className="rounded-lg p-3 border space-y-2"
      style={{ borderColor: color + '30', backgroundColor: color + '08' }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{t?.emoji ?? '🔍'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold truncate" style={{ color }}>{label}</div>
          {t?.binomial && (
            <div className="text-[8px] text-slate-500 italic truncate">{t.binomial}</div>
          )}
        </div>
        <div className="text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0"
          style={{ color, borderColor: color + '40', backgroundColor: color + '15' }}>
          {t?.classTR ?? 'Bilinmiyor'}
        </div>
        <div className="text-[8px] font-bold shrink-0" style={{ color }}>
          %{Math.round(creature.score * 100)}
        </div>
      </div>

      {/* Description */}
      {t?.description && (
        <p className="text-[8px] text-slate-500 leading-relaxed">{t.description}</p>
      )}

      {/* Taxonomy tree */}
      {rows.length > 0 && (
        <div className="pt-1.5 border-t space-y-0.5" style={{ borderColor: color + '20' }}>
          {rows.map((row, i) => (
            <TaxonomyRow
              key={i}
              rank={row.rank}
              value={row.value}
              indent={row.indent}
              highlight={(row as { highlight?: boolean }).highlight}
              italic={(row as { italic?: boolean }).italic}
              color={color}
            />
          ))}
        </div>
      )}
    </div>
  )
}
