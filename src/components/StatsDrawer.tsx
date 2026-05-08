import { useEffect, useState, useCallback } from 'react'
import { getAllReports, type FaceReport } from '../db/faceDB'
import { getEmotionTR, getEmotionColor } from '../utils/faceUtils'
import type { ExpressionScores } from '../types/face'

interface Props {
  open: boolean
  onClose: () => void
  refreshKey: number
}

interface Stats {
  total: number
  avgAge: number
  maleCount: number
  femaleCount: number
  avgSymmetry: number
  avgGoldenRatio: number
  avgOverallScore: number
  topEmotions: { key: string; avg: number }[]
  faceShapes: Record<string, number>
  videoCount: number
  imageCount: number
  ageGroups: { label: string; count: number }[]
  recentScores: number[]
}

function calcStats(reports: FaceReport[]): Stats {
  if (reports.length === 0) return {
    total: 0, avgAge: 0, maleCount: 0, femaleCount: 0,
    avgSymmetry: 0, avgGoldenRatio: 0, avgOverallScore: 0,
    topEmotions: [], faceShapes: {}, videoCount: 0, imageCount: 0,
    ageGroups: [], recentScores: [],
  }

  const n = reports.length
  const avgAge = reports.reduce((s, r) => s + r.result.age, 0) / n
  const maleCount = reports.filter(r => r.result.gender === 'male').length
  const femaleCount = n - maleCount
  const avgSymmetry = reports.reduce((s, r) => s + r.result.symmetryScore, 0) / n
  const avgGoldenRatio = reports.reduce((s, r) => s + r.result.goldenRatioScore, 0) / n
  const avgOverallScore = reports.reduce((s, r) => s + r.overallScore, 0) / n

  const emotionKeys: (keyof ExpressionScores)[] = ['happy', 'neutral', 'sad', 'angry', 'surprised', 'fearful', 'disgusted']
  const topEmotions = emotionKeys.map(key => ({
    key,
    avg: reports.reduce((s, r) => s + ((r.result.expressions as unknown as Record<string, number>)[key] ?? 0), 0) / n * 100
  })).sort((a, b) => b.avg - a.avg)

  const faceShapes: Record<string, number> = {}
  for (const r of reports) {
    faceShapes[r.result.faceShape] = (faceShapes[r.result.faceShape] ?? 0) + 1
  }

  const videoCount = reports.filter(r => r.analysisMode === 'video').length
  const imageCount = n - videoCount

  const ageGroups = [
    { label: '0-17', range: [0, 17] },
    { label: '18-25', range: [18, 25] },
    { label: '26-35', range: [26, 35] },
    { label: '36-50', range: [36, 50] },
    { label: '50+', range: [51, 150] },
  ].map(g => ({
    label: g.label,
    count: reports.filter(r => r.result.age >= g.range[0] && r.result.age <= g.range[1]).length,
  }))

  const recentScores = [...reports].slice(0, 20).reverse().map(r => r.overallScore)

  return { total: n, avgAge, maleCount, femaleCount, avgSymmetry, avgGoldenRatio, avgOverallScore, topEmotions, faceShapes, videoCount, imageCount, ageGroups, recentScores }
}

function StatBox({ label, value, color = '#00d4ff', sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div className="panel-bg cyber-border rounded-lg p-3">
      <div className="text-[9px] text-slate-500 uppercase tracking-widest">{label}</div>
      <div className="text-lg font-bold stat-value mt-1" style={{ color }}>{value}</div>
      {sub && <div className="text-[9px] text-slate-600 mt-0.5">{sub}</div>}
    </div>
  )
}

function MiniSparkline({ values, color = '#00d4ff' }: { values: number[]; color?: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const w = 240
  const h = 40
  const px = (i: number) => (i / (values.length - 1)) * w
  const py = (v: number) => h - (v / max) * h * 0.9 - 2
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ')
  const area = d + ` L${px(values.length - 1)},${h} L0,${h} Z`

  return (
    <svg width={w} height={h}>
      <path d={area} fill={color + '22'} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function StatsDrawer({ open, onClose, refreshKey }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const reports = await getAllReports()
    setStats(calcStats(reports))
    setLoading(false)
  }, [])

  useEffect(() => { if (open) load() }, [open, refreshKey, load])

  if (!open) return null

  const maxShape = stats ? Math.max(...Object.values(stats.faceShapes), 1) : 1
  const maxAge = stats ? Math.max(...stats.ageGroups.map(g => g.count), 1) : 1
  const scoreColor = (s: number) => s >= 80 ? '#00ff9d' : s >= 65 ? '#ffcc00' : '#ff6b35'

  return (
    <div className="fixed inset-0 z-[80] flex" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-[460px] h-full bg-[#0d1425] border-l border-[#1a2744] flex flex-col z-10 shadow-2xl">
        {/* Header */}
        <div className="border-b border-[#1a2744] px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[9px] text-slate-600 tracking-widest uppercase mb-0.5">Veritabanı Analitik</div>
            <h3 className="text-sm font-bold text-cyan-400">İstatistik Paneli</h3>
          </div>
          <button onClick={onClose}
            className="px-2.5 py-1 text-[10px] rounded border border-slate-700 text-slate-400 hover:border-slate-500 transition-all">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => <div key={i} className="loading-cell" />)}
              </div>
            </div>
          )}

          {!loading && stats && stats.total === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-slate-700 text-xs space-y-2">
              <div className="text-2xl">◇</div>
              <p>Henüz kayıtlı veri yok</p>
            </div>
          )}

          {!loading && stats && stats.total > 0 && (
            <>
              {/* Overview */}
              <div>
                <SectionTitle>Genel Bakış</SectionTitle>
                <div className="grid grid-cols-3 gap-2">
                  <StatBox label="Toplam Rapor" value={stats.total} />
                  <StatBox label="Ort. Yaş" value={stats.avgAge.toFixed(1)} unit="yıl" />
                  <StatBox label="Ort. Skor" value={Math.round(stats.avgOverallScore)}
                    color={scoreColor(stats.avgOverallScore)} sub="/100" />
                </div>
              </div>

              {/* Scores */}
              <div>
                <SectionTitle>Ortalama Metrikler</SectionTitle>
                <div className="space-y-2">
                  {[
                    { label: 'Simetri Skoru', value: stats.avgSymmetry, color: '#00d4ff' },
                    { label: 'Altın Oran', value: stats.avgGoldenRatio, color: '#ffcc00' },
                    { label: 'Genel Skor', value: stats.avgOverallScore, color: '#00ff9d' },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-24 shrink-0">{m.label}</span>
                      <div className="flex-1 h-4 bg-slate-800 rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm transition-all duration-700"
                          style={{ width: `${Math.round(m.value)}%`, backgroundColor: m.color + 'cc' }} />
                      </div>
                      <span className="text-[10px] font-bold w-8 text-right stat-value" style={{ color: m.color }}>
                        {Math.round(m.value)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <SectionTitle>Cinsiyet Dağılımı</SectionTitle>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-6 rounded-lg overflow-hidden flex">
                    <div className="h-full flex items-center justify-center text-[9px] font-bold text-[#7b2fff] transition-all duration-700"
                      style={{ width: `${(stats.maleCount / stats.total) * 100}%`, backgroundColor: '#7b2fff33' }}>
                      {stats.maleCount > 0 ? `${Math.round((stats.maleCount / stats.total) * 100)}%` : ''}
                    </div>
                    <div className="h-full flex items-center justify-center text-[9px] font-bold text-pink-400 transition-all duration-700"
                      style={{ width: `${(stats.femaleCount / stats.total) * 100}%`, backgroundColor: '#ec489933' }}>
                      {stats.femaleCount > 0 ? `${Math.round((stats.femaleCount / stats.total) * 100)}%` : ''}
                    </div>
                  </div>
                  <div className="flex gap-3 text-[9px] shrink-0">
                    <span className="text-[#7b2fff]">♂ {stats.maleCount}</span>
                    <span className="text-pink-400">♀ {stats.femaleCount}</span>
                  </div>
                </div>
              </div>

              {/* Source */}
              <div>
                <SectionTitle>Analiz Kaynağı</SectionTitle>
                <div className="flex gap-3">
                  {[
                    { label: 'Kamera', count: stats.videoCount, color: '#00d4ff', icon: '📷' },
                    { label: 'Resim', count: stats.imageCount, color: '#ffcc00', icon: '🖼' },
                  ].map(s => (
                    <div key={s.label} className="flex-1 panel-bg cyber-border rounded-lg p-3 text-center">
                      <div className="text-lg">{s.icon}</div>
                      <div className="text-lg font-bold stat-value" style={{ color: s.color }}>{s.count}</div>
                      <div className="text-[9px] text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Emotions */}
              <div>
                <SectionTitle>Duygu Dağılımı (Ortalama)</SectionTitle>
                <div className="space-y-1.5">
                  {stats.topEmotions.slice(0, 5).map(e => (
                    <div key={e.key} className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 w-16 shrink-0">{getEmotionTR(e.key)}</span>
                      <div className="flex-1 h-3 bg-slate-800 rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm"
                          style={{ width: `${Math.round(e.avg)}%`, backgroundColor: getEmotionColor(e.key) + 'aa' }} />
                      </div>
                      <span className="text-[9px] font-bold w-7 text-right stat-value" style={{ color: getEmotionColor(e.key) }}>
                        {Math.round(e.avg)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Face Shapes */}
              {Object.keys(stats.faceShapes).length > 0 && (
                <div>
                  <SectionTitle>Yüz Şekli Dağılımı</SectionTitle>
                  <div className="space-y-1.5">
                    {Object.entries(stats.faceShapes).sort(([, a], [, b]) => b - a).map(([shape, count]) => (
                      <div key={shape} className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 w-14 shrink-0">{shape}</span>
                        <div className="flex-1 h-3 bg-slate-800 rounded-sm overflow-hidden">
                          <div className="h-full rounded-sm bg-cyan-400/50"
                            style={{ width: `${(count / maxShape) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-cyan-400 font-bold w-4 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age Distribution */}
              <div>
                <SectionTitle>Yaş Grupları</SectionTitle>
                <div className="flex items-end gap-1.5 h-16">
                  {stats.ageGroups.map(g => (
                    <div key={g.label} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[8px] text-cyan-400 font-bold stat-value">
                        {g.count > 0 ? g.count : ''}
                      </div>
                      <div className="w-full rounded-t-sm bg-cyan-400/50 transition-all duration-700"
                        style={{ height: `${(g.count / maxAge) * 40}px`, minHeight: g.count > 0 ? 4 : 0 }} />
                      <div className="text-[8px] text-slate-600">{g.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score Sparkline */}
              {stats.recentScores.length >= 2 && (
                <div>
                  <SectionTitle>Son {stats.recentScores.length} Rapor Skoru</SectionTitle>
                  <div className="panel-bg cyber-border rounded-lg p-3">
                    <MiniSparkline values={stats.recentScores} color="#00d4ff" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1 h-3 rounded-full bg-cyan-400" />
      <span className="text-[9px] uppercase tracking-widest text-slate-400">{children}</span>
    </div>
  )
}
