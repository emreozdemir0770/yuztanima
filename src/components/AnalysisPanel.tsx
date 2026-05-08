import { useState, useEffect } from 'react'
import type { FaceAnalysisResult, ExpressionScores, TrackedFace } from '../types/face'
import { getDominantEmotion, getGenderTR } from '../utils/faceUtils'
import EmotionBars from './EmotionBars'
import StatCard from './StatCard'
import RadarChart from './RadarChart'
import HeadPoseIndicator from './HeadPoseIndicator'
import EmotionTimeline from './EmotionTimeline'

interface Props {
  result: FaceAnalysisResult | null
  allFaces?: TrackedFace[]
  noFace: boolean
  fps: number
  frameCount: number
  modelsLoaded: boolean
  cameraActive: boolean
  emotionHistory?: ExpressionScores[]
  onSaveReport?: () => void
  saving?: boolean
}

function Section({ title, children, accent = '#00d4ff' }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="panel-bg cyber-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: accent }} />
        <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function AnalysisPanel({
  result, allFaces, noFace, fps, frameCount, modelsLoaded, cameraActive,
  emotionHistory, onSaveReport, saving,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Reset to first face when face count changes
  useEffect(() => {
    setSelectedIdx(0)
  }, [allFaces?.length])

  // Pick the face to display — selected tab wins over the passed-in `result`
  const multiMode = allFaces && allFaces.length > 1
  const activeResult: FaceAnalysisResult | null = multiMode
    ? (allFaces[selectedIdx] ?? allFaces[0])
    : result

  const accentColor = multiMode ? (allFaces[selectedIdx]?.color ?? '#00d4ff') : '#00d4ff'

  const radarMetrics = activeResult ? [
    { label: 'Simetri', value: activeResult.symmetryScore, color: '#00d4ff' },
    { label: 'Altın Oran', value: activeResult.goldenRatioScore, color: '#ffcc00' },
    { label: 'Cinsiyet', value: activeResult.genderProbability * 100, color: '#7b2fff' },
    { label: 'Sol Göz', value: activeResult.eyeData.leftOpenness, color: '#00ff9d' },
    { label: 'Sağ Göz', value: activeResult.eyeData.rightOpenness, color: '#ff6b35' },
    { label: 'Çene', value: activeResult.jawline.sharpness, color: '#ff3366' },
  ] : []

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      {/* Multi-face tabs */}
      {multiMode && (
        <div className="panel-bg cyber-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
            <span className="text-[9px] uppercase tracking-widest text-slate-400">
              Tespit Edilen Yüzler
            </span>
            <span className="ml-auto text-[9px] font-bold" style={{ color: accentColor }}>
              {allFaces.length} kişi
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allFaces.map((face, i) => (
              <button
                key={face.index}
                onClick={() => setSelectedIdx(i)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border"
                style={{
                  borderColor: i === selectedIdx ? face.color + '88' : face.color + '22',
                  backgroundColor: i === selectedIdx ? face.color + '20' : face.color + '08',
                  color: i === selectedIdx ? face.color : face.color + '88',
                  boxShadow: i === selectedIdx ? `0 0 10px ${face.color}22` : 'none',
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: face.color, opacity: i === selectedIdx ? 1 : 0.4 }}
                />
                <span>Yüz #{i + 1}</span>
                <span className="opacity-60">
                  {face.gender === 'male' ? '♂' : '♀'} {face.age}y
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* System Status */}
      <Section title="Sistem Durumu">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full pulsing-dot ${modelsLoaded ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-slate-400">AI Modeller</span>
            <span className={modelsLoaded ? 'text-green-400' : 'text-yellow-400'}>
              {modelsLoaded ? 'Hazır' : 'Yükleniyor...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full pulsing-dot ${cameraActive ? 'bg-cyan-400' : 'bg-slate-600'}`} />
            <span className="text-slate-400">Kamera</span>
            <span className={cameraActive ? 'text-cyan-400' : 'text-slate-500'}>
              {cameraActive ? 'Aktif' : 'Kapalı'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full`}
              style={{ backgroundColor: activeResult ? accentColor : noFace ? '#f87171' : '#374151' }} />
            <span className="text-slate-400">Yüz</span>
            <span style={{ color: activeResult ? accentColor : noFace ? '#f87171' : '#64748b' }}>
              {activeResult
                ? (multiMode ? `${allFaces!.length} kişi` : 'Algılandı')
                : noFace ? 'Bulunamadı' : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">FPS</span>
            <span className="text-cyan-400 font-bold stat-value">{fps}</span>
            <span className="text-slate-600">/ {frameCount}</span>
          </div>
        </div>
      </Section>

      {activeResult && onSaveReport && (
        <button
          onClick={onSaveReport}
          disabled={saving}
          className="w-full py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
            bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30
            hover:border-green-400 hover:shadow-[0_0_20px_#00ff9d22]"
        >
          {saving ? '⟳  KAYDEDİLİYOR...' : '⊕  RAPOR OLUŞTUR & KAYDET'}
        </button>
      )}

      {activeResult ? (
        <>
          {/* Identity */}
          <Section title="Kimlik Analizi" accent={accentColor}>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Tahmini Yaş" value={activeResult.age} unit="yıl" color={accentColor} icon="👤" />
              <StatCard label="Cinsiyet" value={getGenderTR(activeResult.gender)} color="#7b2fff" icon="⚧"
                sub={`%${Math.round(activeResult.genderProbability * 100)} güven`} />
              <StatCard label="Baskın Duygu" value={getDominantEmotion(activeResult.expressions as unknown as Record<string, number>)} color="#ffcc00" icon="😊" />
              <StatCard label="Yüz Şekli" value={activeResult.faceShape} color="#00ff9d" icon="◇" />
            </div>
          </Section>

          {/* Emotion Analysis */}
          <Section title="Duygu Analizi" accent={accentColor}>
            <EmotionBars expressions={activeResult.expressions} />
          </Section>

          {/* Emotion Timeline — only in video mode, only for primary face */}
          {fps > 0 && emotionHistory && !multiMode && (
            <Section title="Duygu Zaman Çizelgesi" accent={accentColor}>
              <EmotionTimeline history={emotionHistory} width={252} height={90} />
            </Section>
          )}

          {/* Geometric Analysis */}
          <Section title="Geometrik Analiz" accent={accentColor}>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <StatCard label="Simetri Skoru" value={activeResult.symmetryScore} unit="%" icon="⟺"
                color={activeResult.symmetryScore > 85 ? '#00ff9d' : activeResult.symmetryScore > 75 ? '#ffcc00' : '#ff6b35'} />
              <StatCard label="Altın Oran" value={activeResult.goldenRatioScore} unit="%" icon="φ"
                color={activeResult.goldenRatioScore > 85 ? '#00ff9d' : '#ffcc00'} sub="φ = 1.618" />
              <StatCard label="Yüz Gen." value={Math.round(activeResult.faceWidth)} unit="px" color="#00d4ff" icon="↔" />
              <StatCard label="Yüz Yük." value={Math.round(activeResult.faceHeight)} unit="px" color="#00d4ff" icon="↕" />
            </div>
            <div className="flex justify-center">
              <RadarChart metrics={radarMetrics} size={160} />
            </div>
          </Section>

          {/* Head Pose */}
          <Section title="Baş Pozisyonu" accent={accentColor}>
            <HeadPoseIndicator pose={activeResult.headPose} />
          </Section>

          {/* Eye Analysis */}
          <Section title="Göz Analizi" accent={accentColor}>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <StatCard label="Sol Göz" value={activeResult.eyeData.leftOpenness} unit="%" color="#00d4ff" icon="◉" />
              <StatCard label="Sağ Göz" value={activeResult.eyeData.rightOpenness} unit="%" color="#00d4ff" icon="◉" />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between px-1">
              <span>Gözlerarası Mesafe</span>
              <span className="font-bold stat-value" style={{ color: accentColor }}>
                {Math.round(activeResult.eyeData.interocularDistance)} px
              </span>
            </div>
          </Section>

          {/* Jawline */}
          <Section title="Çene Analizi" accent={accentColor}>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Çene Açısı" value={activeResult.jawline.angle} unit="°" color="#ff6b35" icon="∠" />
              <StatCard label="Çene Keskinliği" value={activeResult.jawline.sharpness} unit="%" color="#ff3366" icon="◇" />
            </div>
          </Section>
        </>
      ) : (
        <div className="panel-bg cyber-border rounded-xl p-6 flex flex-col items-center gap-3 text-center">
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="loading-cell" />)}
          </div>
          <p className="text-slate-500 text-[11px]">
            {!cameraActive
              ? 'Kamerayı başlatın ve yüzünüzü kameraya gösterin'
              : noFace ? 'Yüz algılanamadı — kameraya bakın'
              : 'Yüz bekleniyor...'}
          </p>
        </div>
      )}
    </div>
  )
}
