import { useState, useCallback, useEffect } from 'react'
import { useFaceAnalysis } from './hooks/useFaceAnalysis'
import { useCreatureDetection } from './hooks/useCreatureDetection'
import AnalysisPanel from './components/AnalysisPanel'
import ImageCapture from './components/ImageCapture'
import ReportHistory from './components/ReportHistory'
import StatsDrawer from './components/StatsDrawer'
import OverlayControls from './components/OverlayControls'
import MultiFaceBar from './components/MultiFaceBar'
import CreaturePanel from './components/CreaturePanel'
import { buildReport, saveReport } from './db/faceDB'

type Mode = 'video' | 'image'

export default function App() {
  const [mode, setMode] = useState<Mode>('video')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [historyKey, setHistoryKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)
  const [snapshotFlash, setSnapshotFlash] = useState(false)

  const { creaturesLoaded, creatures, detectFrame, detectImage } = useCreatureDetection()

  const {
    videoRef, canvasRef,
    modelsLoaded, cameraActive,
    result, allFaces,
    emotionHistory,
    overlaySettings, setOverlaySettings,
    fps, frameCount,
    loadingError, noFaceDetected,
    cameras, activeCameraId,
    startCamera, stopCamera, takeSnapshot, enumerateCameras,
  } = useFaceAnalysis(detectFrame)

  const [cameraListOpen, setCameraListOpen] = useState(false)

  const handleCameraSelect = useCallback(async (deviceId: string) => {
    if (cameraActive) stopCamera()
    await startCamera(deviceId)
    setCameraListOpen(false)
  }, [cameraActive, stopCamera, startCamera])

  const handleOpenCameraList = useCallback(async () => {
    await enumerateCameras()
    setCameraListOpen(v => !v)
  }, [enumerateCameras])

  useEffect(() => {
    if (!cameraListOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-camera-picker]')) setCameraListOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [cameraListOpen])

  const switchMode = (m: Mode) => {
    if (m === mode) return
    if (cameraActive) stopCamera()
    setMode(m)
  }

  const handleSaveVideoReport = useCallback(async () => {
    if (!result) return
    setSaving(true)
    try {
      const snapshot = takeSnapshot()
      const report = buildReport(result, snapshot, 'video', creatures)
      await saveReport(report)
      setHistoryKey(k => k + 1)
      setSavedNotice(true)
      setTimeout(() => setSavedNotice(false), 2500)
    } finally {
      setSaving(false)
    }
  }, [result, takeSnapshot])

  const handleSnapshot = useCallback(async () => {
    const snap = takeSnapshot()
    if (!snap) return
    setSnapshotFlash(true)
    setTimeout(() => setSnapshotFlash(false), 300)

    if (result) {
      // Save as report directly
      const report = buildReport(result, snap, 'video', creatures)
      await saveReport(report)
      setHistoryKey(k => k + 1)
      setSavedNotice(true)
      setTimeout(() => setSavedNotice(false), 2500)
    } else {
      // Just download the image
      const a = document.createElement('a')
      a.href = snap
      a.download = `snapshot-${Date.now()}.jpg`
      a.click()
    }
  }, [takeSnapshot, result])

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200 font-mono">
      {/* Header */}
      <header className="border-b border-[#1a2744] bg-[#0d1425]/80 backdrop-blur px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 shrink-0">
            <div className="absolute inset-0 border-2 border-cyan-400 rounded rotate-45" />
            <div className="absolute inset-2 bg-cyan-400/20 rounded-sm rotate-45" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-cyan-400 tracking-wider uppercase">FaceAnalyzer AI</h1>
            <p className="text-[9px] text-slate-600 tracking-widest">GERÇEK ZAMANLI YÜZ ANALİZ SİSTEMİ v2.0</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 bg-[#0a0e1a] border border-[#1a2744] rounded-lg p-1">
          <TabBtn active={mode === 'video'} onClick={() => switchMode('video')} icon={
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          } label="Kamera" />
          <TabBtn active={mode === 'image'} onClick={() => switchMode('image')} icon={
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          } label="Resim" />
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && <div className="text-[10px] text-green-400 animate-pulse">✓ Kaydedildi</div>}
          {modelsLoaded && (
            <div className="hidden md:flex items-center gap-1.5 text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulsing-dot" />
              <span className="text-green-400">4 Model</span>
            </div>
          )}
          <button onClick={() => { setStatsOpen(true) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a2744] text-slate-400
              hover:text-cyan-400 hover:border-cyan-900/60 transition-all text-[10px] font-bold tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">İSTATİSTİK</span>
          </button>
          <button onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1a2744] text-slate-400
              hover:text-cyan-400 hover:border-cyan-900/60 transition-all text-[10px] font-bold tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="hidden sm:inline">RAPORLAR</span>
          </button>
        </div>
      </header>

      {loadingError && (
        <div className="bg-red-900/30 border-b border-red-800/50 px-6 py-2 text-[11px] text-red-400">
          ⚠ {loadingError}
        </div>
      )}

      {/* Main */}
      <main className="p-4" style={{ height: 'calc(100vh - 57px)' }}>
        {mode === 'video' && (
          <div className="flex gap-4 h-full">
            <div className="flex-1 flex flex-col gap-2 min-w-0">
              {/* Camera Feed */}
              <div className="flex-1 panel-bg cyber-border rounded-xl overflow-hidden relative min-h-0">
                <div className="corner-tl" /><div className="corner-tr" />
                <div className="corner-bl" /><div className="corner-br" />
                {cameraActive && <div className="scan-line" />}

                {/* Snapshot flash */}
                {snapshotFlash && <div className="absolute inset-0 bg-white/30 z-20 pointer-events-none" />}

                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline
                  style={{ transform: 'scaleX(-1)' }} />
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"
                  style={{ transform: 'scaleX(-1)', pointerEvents: 'none' }} />

                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full rotate-slow" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-cyan-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-slate-600 text-xs tracking-wider">KAMERA BAŞLATILMAYI BEKLİYOR</p>
                  </div>
                )}

                {cameraActive && (
                  <>
                    <div className="absolute top-3 left-3 text-[9px] text-cyan-400/60 pointer-events-none flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 pulsing-dot" /><span>REC</span>
                    </div>
                    <div className="absolute top-3 right-3 text-[9px] text-cyan-400/60 pointer-events-none">
                      {fps} FPS · {allFaces.length} yüz
                    </div>
                    {result && (
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[9px] pointer-events-none">
                        <div className="bg-[#0d1425]/90 border border-[#1a2744] rounded px-2 py-1 text-cyan-400">
                          YAŞ: {result.age} | {result.gender === 'male' ? 'ERKEK' : 'KADIN'}
                        </div>
                        <div className="bg-[#0d1425]/90 border border-[#1a2744] rounded px-2 py-1 text-cyan-400">
                          SİMETRİ: %{Math.round(result.symmetryScore)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Overlay Controls + Snapshot row */}
              {cameraActive && (
                <div className="flex items-center justify-between gap-2 shrink-0 panel-bg cyber-border rounded-xl px-3 py-2">
                  <OverlayControls settings={overlaySettings} onChange={setOverlaySettings} />
                  <button
                    onClick={handleSnapshot}
                    title={result ? 'Anlık fotoğraf çek ve rapor kaydet' : 'Anlık fotoğraf çek ve indir'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all
                      bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30
                      hover:border-purple-400 hover:shadow-[0_0_15px_#7b2fff22] shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    SNAPSHOT
                  </button>
                </div>
              )}

              {/* Multi-face bar */}
              <MultiFaceBar faces={allFaces} />

              {/* Controls */}
              <div className="flex gap-2 shrink-0">
                {!cameraActive ? (
                  <button onClick={() => startCamera()} disabled={!modelsLoaded}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200
                      disabled:opacity-40 disabled:cursor-not-allowed
                      bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30
                      hover:border-cyan-400 hover:shadow-[0_0_20px_#00d4ff22]">
                    {modelsLoaded ? '▶  KAMERAYI BAŞLAT' : '⟳  MODELLER YÜKLENİYOR...'}
                  </button>
                ) : (
                  <button onClick={stopCamera}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200
                      bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30
                      hover:border-red-400 hover:shadow-[0_0_20px_#ff336622]">
                    ■  DURDUR
                  </button>
                )}
                {/* Camera source picker */}
                <div className="relative shrink-0" data-camera-picker>
                  <button
                    onClick={handleOpenCameraList}
                    disabled={!modelsLoaded}
                    title="Kamera kaynağı seç"
                    className="h-full px-3 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200
                      disabled:opacity-40 disabled:cursor-not-allowed
                      bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 border border-slate-700/50
                      hover:border-slate-400 hover:text-slate-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      <circle cx="9" cy="13" r="1" fill="currentColor" />
                    </svg>
                  </button>
                  {cameraListOpen && cameras.length > 0 && (
                    <div className="absolute bottom-full mb-2 right-0 z-50 panel-bg cyber-border rounded-xl overflow-hidden min-w-[240px] shadow-2xl">
                      <div className="px-3 py-2 border-b border-[#1a2744] flex items-center gap-2">
                        <div className="w-1 h-3 rounded-full bg-cyan-400" />
                        <span className="text-[9px] uppercase tracking-widest text-slate-400">Kamera Kaynakları</span>
                        <span className="ml-auto text-[9px] text-slate-600">{cameras.length} cihaz</span>
                      </div>
                      {cameras.map((cam, i) => {
                        const isActive = activeCameraId
                          ? cam.deviceId === activeCameraId
                          : i === 0 && !activeCameraId && cameraActive
                        return (
                          <button
                            key={cam.deviceId}
                            onClick={() => handleCameraSelect(cam.deviceId)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all
                              hover:bg-cyan-500/10 border-b border-[#1a2744]/50 last:border-0
                              ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-cyan-400 pulsing-dot' : 'bg-slate-700'}`} />
                            <div className="min-w-0">
                              <div className="text-[10px] font-medium truncate">
                                {cam.label || `Kamera ${i + 1}`}
                              </div>
                              <div className="text-[8px] text-slate-600 font-mono truncate">{cam.deviceId.slice(0, 20)}…</div>
                            </div>
                            {isActive && <span className="ml-auto text-[8px] text-cyan-400 shrink-0">AKTİF</span>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Model Status */}
              <div className="panel-bg cyber-border rounded-xl p-2.5 grid grid-cols-4 gap-2 shrink-0">
                {[
                  { name: 'SSD MobileNet', role: 'Yüz Tespiti', color: '#00d4ff' },
                  { name: 'Landmark 68', role: '68 Nokta', color: '#7b2fff' },
                  { name: 'Expression', role: '7 Duygu', color: '#ffcc00' },
                  { name: 'Age/Gender', role: 'Yaş & Cin.', color: '#00ff9d' },
                ].map(m => (
                  <div key={m.name} className="text-center space-y-1">
                    <div className="text-[8px] font-semibold" style={{ color: m.color }}>{m.name}</div>
                    <div className="text-[8px] text-slate-600">{m.role}</div>
                    <div className={`w-1.5 h-1.5 rounded-full mx-auto ${modelsLoaded ? 'pulsing-dot' : ''}`}
                      style={{ backgroundColor: modelsLoaded ? m.color : '#374151' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Panel */}
            <div className="w-[300px] shrink-0 overflow-y-auto space-y-3">
              <AnalysisPanel
                result={result}
                allFaces={allFaces}
                noFace={noFaceDetected}
                fps={fps}
                frameCount={frameCount}
                modelsLoaded={modelsLoaded}
                cameraActive={cameraActive}
                emotionHistory={emotionHistory}
                onSaveReport={handleSaveVideoReport}
                saving={saving}
              />
              <CreaturePanel creatures={creatures} creaturesLoaded={creaturesLoaded} />
            </div>
          </div>
        )}

        {mode === 'image' && (
          <ImageCapture
            modelsLoaded={modelsLoaded}
            onReportSaved={() => setHistoryKey(k => k + 1)}
            detectImage={detectImage}
            creaturesLoaded={creaturesLoaded}
          />
        )}
      </main>

      <ReportHistory open={historyOpen} onClose={() => setHistoryOpen(false)} refreshKey={historyKey} />
      <StatsDrawer open={statsOpen} onClose={() => setStatsOpen(false)} refreshKey={historyKey} />
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string
}) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-widest uppercase transition-all duration-200
        ${active
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_10px_#00d4ff22]'
          : 'text-slate-500 hover:text-slate-300'
        }`}>
      {icon}{label}
    </button>
  )
}
