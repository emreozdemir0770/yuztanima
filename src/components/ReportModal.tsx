import type { FaceReport } from '../db/faceDB'
import { getEmotionTR, getEmotionColor, getGenderTR } from '../utils/faceUtils'
import { getClassColor } from '../utils/taxonomy'
import type { ExpressionScores } from '../types/face'
import type { DetectedCreature } from '../hooks/useCreatureDetection'
import type { BioTaxonomy } from '../utils/taxonomy'

interface Props {
  report: FaceReport
  onClose: () => void
  onDelete?: () => void
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size / 2 - 8
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 85 ? '#00ff9d' : score >= 70 ? '#ffcc00' : '#ff6b35'

  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a2744" strokeWidth="6" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize="15" fontWeight="bold" fill={color} fontFamily="monospace">
        {Math.round(score)}
      </text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fill="#64748b" fontFamily="monospace">
        /100
      </text>
    </svg>
  )
}

function ModalTaxonomyCard({ creature }: { creature: DetectedCreature }) {
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
    <div className="rounded-xl p-4 border space-y-3"
      style={{ borderColor: color + '33', backgroundColor: color + '08' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{t?.emoji ?? '🔍'}</span>
          <div>
            <div className="text-sm font-bold" style={{ color }}>{label}</div>
            {t?.binomial && (
              <div className="text-[10px] text-slate-500 italic">{t.binomial}</div>
            )}
            {t?.description && (
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed max-w-sm">{t.description}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded border"
            style={{ color, borderColor: color + '44', backgroundColor: color + '15' }}>
            {t?.classTR ?? 'Bilinmiyor'}
          </span>
          <span className="text-[10px] font-bold" style={{ color }}>
            Güven: %{Math.round(creature.score * 100)}
          </span>
        </div>
      </div>

      {/* Full taxonomy tree */}
      {rows.length > 0 && (
        <div className="border-t pt-3 space-y-1" style={{ borderColor: color + '25' }}>
          <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">7 Basamaklı Sınıflandırma</div>
          {rows.map((row, i) => (
            <div key={i} className="flex items-start gap-2" style={{ paddingLeft: `${row.indent * 14}px` }}>
              <span className="text-[9px] text-slate-600 mt-0.5 shrink-0">└</span>
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="text-[9px] text-slate-600 shrink-0 w-10">{row.rank}</span>
                <span
                  className={`text-[10px] ${(row as {highlight?:boolean}).highlight ? 'font-bold' : 'font-medium'}`}
                  style={{
                    color: (row as {highlight?:boolean}).highlight ? color : '#94a3b8',
                    fontStyle: (row as {italic?:boolean}).italic ? 'italic' : 'normal',
                  }}
                >
                  {row.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MiniBar({ value, color, label }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-slate-800 rounded-sm overflow-hidden">
        <div className="h-full rounded-sm transition-all duration-700"
          style={{ width: `${Math.round(value)}%`, backgroundColor: color + 'cc' }} />
      </div>
      <span className="text-[10px] font-bold w-8 text-right" style={{ color }}>{Math.round(value)}%</span>
    </div>
  )
}

const EMOTION_ORDER: (keyof ExpressionScores)[] = ['happy', 'neutral', 'surprised', 'sad', 'angry', 'fearful', 'disgusted']

export default function ReportModal({ report, onClose, onDelete }: Props) {
  const r = report.result
  const date = new Date(report.timestamp)
  const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const handlePrint = () => window.print()

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="panel-bg border border-[#1a2744] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl print:shadow-none print:max-h-none">
        {/* Report Header */}
        <div className="sticky top-0 z-10 panel-bg border-b border-[#1a2744] px-6 py-4 flex items-center justify-between print:static">
          <div>
            <div className="text-[9px] text-slate-600 tracking-widest uppercase mb-0.5">FaceAnalyzer AI — Analiz Raporu</div>
            <h2 className="text-sm font-bold text-cyan-400 tracking-wide">
              Rapor #{report.id} — {dateStr} {timeStr}
            </h2>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={handlePrint}
              className="px-3 py-1.5 text-[10px] rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all">
              ⎙ Yazdır / PDF
            </button>
            {onDelete && (
              <button onClick={onDelete}
                className="px-3 py-1.5 text-[10px] rounded-lg border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-all">
                Sil
              </button>
            )}
            <button onClick={onClose}
              className="px-3 py-1.5 text-[10px] rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-all">
              ✕ Kapat
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-5">
          {/* Col 1: Snapshot + Score */}
          <div className="col-span-1 flex flex-col gap-4">
            {/* Snapshot */}
            <div className="cyber-border rounded-xl overflow-hidden bg-black/30 relative">
              <div className="corner-tl" />
              <div className="corner-tr" />
              <div className="corner-bl" />
              <div className="corner-br" />
              {report.imageSnapshot ? (
                <img src={report.imageSnapshot} alt="Yüz analizi"
                  className="w-full object-cover rounded-xl" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center text-slate-700 text-xs">
                  Görüntü yok
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[8px]">
                <span className="bg-[#0d1425]/90 border border-[#1a2744] rounded px-1.5 py-0.5 text-cyan-400">
                  {report.analysisMode === 'video' ? '📷 Kamera' : '🖼 Resim'}
                </span>
                <span className="bg-[#0d1425]/90 border border-[#1a2744] rounded px-1.5 py-0.5 text-slate-400">
                  {timeStr}
                </span>
              </div>
            </div>

            {/* Overall Score */}
            <div className="panel-bg cyber-border rounded-xl p-4 flex flex-col items-center gap-2">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest">Genel Skor</div>
              <ScoreRing score={report.overallScore} size={90} />
              <div className="text-[10px] text-center" style={{
                color: report.overallScore >= 85 ? '#00ff9d' : report.overallScore >= 70 ? '#ffcc00' : '#ff6b35'
              }}>
                {report.overallScore >= 85 ? 'Mükemmel' : report.overallScore >= 70 ? 'İyi' : 'Orta'}
              </div>
            </div>

            {/* Quick stats */}
            <div className="panel-bg cyber-border rounded-xl p-4 space-y-2.5">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">Kimlik</div>
              {[
                { label: 'Tahmini Yaş', value: `${r.age} yıl`, color: '#00d4ff' },
                { label: 'Cinsiyet', value: `${getGenderTR(r.gender)} (%${Math.round(r.genderProbability * 100)})`, color: '#7b2fff' },
                { label: 'Yüz Şekli', value: r.faceShape, color: '#00ff9d' },
                { label: 'Analiz Modu', value: report.analysisMode === 'video' ? 'Kamera' : 'Resim', color: '#ffcc00' },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">{s.label}</span>
                  <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2+3: Details */}
          <div className="col-span-2 flex flex-col gap-4">
            {/* Geometric Analysis */}
            <div className="panel-bg cyber-border rounded-xl p-4">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Geometrik Analiz</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <MiniBar label="Simetri Skoru" value={r.symmetryScore}
                    color={r.symmetryScore >= 85 ? '#00ff9d' : r.symmetryScore >= 75 ? '#ffcc00' : '#ff6b35'} />
                  <MiniBar label="Altın Oran φ" value={r.goldenRatioScore} color="#ffcc00" />
                  <MiniBar label="Cinsiyet Güven" value={r.genderProbability * 100} color="#7b2fff" />
                </div>
                <div className="space-y-2">
                  <MiniBar label="Sol Göz" value={r.eyeData.leftOpenness} color="#00d4ff" />
                  <MiniBar label="Sağ Göz" value={r.eyeData.rightOpenness} color="#00d4ff" />
                  <MiniBar label="Çene Keskinliği" value={r.jawline.sharpness} color="#ff6b35" />
                </div>
              </div>
            </div>

            {/* Emotion Analysis */}
            <div className="panel-bg cyber-border rounded-xl p-4">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Duygu Analizi</div>
              <div className="space-y-1.5">
                {EMOTION_ORDER.map(key => {
                  const val = (r.expressions as unknown as Record<string, number>)[key] ?? 0
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-16 shrink-0">{getEmotionTR(key)}</span>
                      <div className="flex-1 h-3.5 bg-slate-800 rounded-sm overflow-hidden">
                        <div className="h-full rounded-sm transition-all duration-700"
                          style={{ width: `${Math.round(val * 100)}%`, backgroundColor: getEmotionColor(key) + 'bb' }} />
                      </div>
                      <span className="text-[10px] font-bold w-8 text-right" style={{ color: getEmotionColor(key) }}>
                        {Math.round(val * 100)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Head Pose */}
            <div className="panel-bg cyber-border rounded-xl p-4">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Baş Pozisyonu</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Pitch (Yukarı/Aşağı)', value: r.headPose.pitch, color: '#00ff9d' },
                  { label: 'Yaw (Sağ/Sol)', value: r.headPose.yaw, color: '#7b2fff' },
                  { label: 'Roll (Eğim)', value: r.headPose.roll, color: '#ffcc00' },
                ].map(p => (
                  <div key={p.label} className="text-center">
                    <div className="text-[9px] text-slate-500 mb-1">{p.label}</div>
                    <div className="text-lg font-bold stat-value" style={{ color: p.color }}>
                      {p.value.toFixed(1)}°
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Measurements */}
            <div className="panel-bg cyber-border rounded-xl p-4">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">Ölçümler</div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Yüz Genişliği', value: `${Math.round(r.faceWidth)} px` },
                  { label: 'Yüz Yüksekliği', value: `${Math.round(r.faceHeight)} px` },
                  { label: 'G. Mesafesi', value: `${Math.round(r.eyeData.interocularDistance)} px` },
                  { label: 'Çene Açısı', value: `${r.jawline.angle.toFixed(1)}°` },
                  { label: 'En/Boy Oranı', value: (r.faceWidth / r.faceHeight).toFixed(2) },
                  { label: 'Çene Genişliği', value: `${Math.round(r.jawline.width)} px` },
                ].map(m => (
                  <div key={m.label}>
                    <div className="text-[9px] text-slate-500">{m.label}</div>
                    <div className="text-[13px] font-bold text-cyan-400 stat-value">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="panel-bg cyber-border rounded-xl p-4">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">AI Tespitler & Yorumlar</div>
              <ul className="space-y-2">
                {report.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                    <span className="text-cyan-400 mt-0.5 shrink-0">›</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Biological classification */}
            {report.creatures && report.creatures.length > 0 && (
              <div className="panel-bg cyber-border rounded-xl p-4">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-3">
                  Biyolojik Sınıflandırma ({report.creatures.length} canlı)
                </div>
                <div className="space-y-4">
                  {report.creatures.map(c => (
                    <ModalTaxonomyCard key={c.id} creature={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#1a2744] px-6 py-3 flex justify-between items-center text-[9px] text-slate-700">
          <span>FaceAnalyzer AI — face-api.js + TensorFlow.js</span>
          <span>{dateStr} · {timeStr}</span>
        </div>
      </div>
    </div>
  )
}
