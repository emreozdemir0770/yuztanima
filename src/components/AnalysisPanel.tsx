import type { FaceAnalysisResult } from '../types/face'
import { getDominantEmotion, getGenderTR } from '../utils/faceUtils'
import EmotionBars from './EmotionBars'
import StatCard from './StatCard'
import RadarChart from './RadarChart'
import HeadPoseIndicator from './HeadPoseIndicator'

interface Props {
  result: FaceAnalysisResult | null
  noFace: boolean
  fps: number
  frameCount: number
  modelsLoaded: boolean
  cameraActive: boolean
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel-bg cyber-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-cyan-400" />
        <h3 className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function AnalysisPanel({ result, noFace, fps, frameCount, modelsLoaded, cameraActive }: Props) {
  const radarMetrics = result ? [
    { label: 'Simetri', value: result.symmetryScore, color: '#00d4ff' },
    { label: 'Altın Oran', value: result.goldenRatioScore, color: '#ffcc00' },
    { label: 'Cinsiyet', value: result.genderProbability * 100, color: '#7b2fff' },
    { label: 'Sol Göz', value: result.eyeData.leftOpenness, color: '#00ff9d' },
    { label: 'Sağ Göz', value: result.eyeData.rightOpenness, color: '#ff6b35' },
    { label: 'Çene', value: result.jawline.sharpness, color: '#ff3366' },
  ] : []

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
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
            <div className={`w-2 h-2 rounded-full ${result ? 'bg-cyan-400 pulsing-dot' : 'bg-slate-600'}`} />
            <span className="text-slate-400">Yüz</span>
            <span className={result ? 'text-cyan-400' : noFace ? 'text-red-400' : 'text-slate-500'}>
              {result ? 'Algılandı' : noFace ? 'Bulunamadı' : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">FPS</span>
            <span className="text-cyan-400 font-bold stat-value">{fps}</span>
            <span className="text-slate-600">/ {frameCount}</span>
          </div>
        </div>
      </Section>

      {result ? (
        <>
          {/* Identity */}
          <Section title="Kimlik Analizi">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Tahmini Yaş" value={result.age} unit="yıl" color="#00d4ff" icon="👤" />
              <StatCard
                label="Cinsiyet"
                value={getGenderTR(result.gender)}
                color="#7b2fff"
                icon="⚧"
                sub={`%${Math.round(result.genderProbability * 100)} güven`}
              />
              <StatCard label="Baskın Duygu" value={getDominantEmotion(result.expressions as unknown as Record<string, number>)} color="#ffcc00" icon="😊" />
              <StatCard label="Yüz Şekli" value={result.faceShape} color="#00ff9d" icon="◇" />
            </div>
          </Section>

          {/* Emotion Analysis */}
          <Section title="Duygu Analizi">
            <EmotionBars expressions={result.expressions} />
          </Section>

          {/* Geometric Analysis */}
          <Section title="Geometrik Analiz">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <StatCard
                label="Simetri Skoru"
                value={result.symmetryScore}
                unit="%"
                color={result.symmetryScore > 85 ? '#00ff9d' : result.symmetryScore > 75 ? '#ffcc00' : '#ff6b35'}
                icon="⟺"
              />
              <StatCard
                label="Altın Oran"
                value={result.goldenRatioScore}
                unit="%"
                color={result.goldenRatioScore > 85 ? '#00ff9d' : '#ffcc00'}
                icon="φ"
                sub="φ = 1.618"
              />
              <StatCard
                label="Yüz Gen."
                value={Math.round(result.faceWidth)}
                unit="px"
                color="#00d4ff"
                icon="↔"
              />
              <StatCard
                label="Yüz Yük."
                value={Math.round(result.faceHeight)}
                unit="px"
                color="#00d4ff"
                icon="↕"
              />
            </div>

            {/* Radar Chart */}
            <div className="flex justify-center">
              <RadarChart metrics={radarMetrics} size={160} />
            </div>
          </Section>

          {/* Head Pose */}
          <Section title="Baş Pozisyonu">
            <HeadPoseIndicator pose={result.headPose} />
          </Section>

          {/* Eye Analysis */}
          <Section title="Göz Analizi">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <StatCard
                label="Sol Göz"
                value={result.eyeData.leftOpenness}
                unit="%"
                color="#00d4ff"
                icon="◉"
              />
              <StatCard
                label="Sağ Göz"
                value={result.eyeData.rightOpenness}
                unit="%"
                color="#00d4ff"
                icon="◉"
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between px-1">
              <span>Gözlerarası Mesafe</span>
              <span className="text-cyan-400 font-bold stat-value">
                {Math.round(result.eyeData.interocularDistance)} px
              </span>
            </div>
          </Section>

          {/* Jawline */}
          <Section title="Çene Analizi">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Çene Açısı" value={result.jawline.angle} unit="°" color="#ff6b35" icon="∠" />
              <StatCard label="Çene Keskinliği" value={result.jawline.sharpness} unit="%" color="#ff3366" icon="◇" />
            </div>
          </Section>
        </>
      ) : (
        <div className="panel-bg cyber-border rounded-xl p-6 flex flex-col items-center gap-3 text-center">
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="loading-cell" />
            ))}
          </div>
          <p className="text-slate-500 text-[11px]">
            {!cameraActive
              ? 'Kamerayı başlatın ve yüzünüzü kameraya gösterin'
              : noFace
              ? 'Yüz algılanamadı — kameraya bakın'
              : 'Yüz bekleniyor...'}
          </p>
        </div>
      )}
    </div>
  )
}
