import { useFaceAnalysis } from './hooks/useFaceAnalysis'
import AnalysisPanel from './components/AnalysisPanel'

export default function App() {
  const {
    videoRef,
    canvasRef,
    modelsLoaded,
    cameraActive,
    result,
    fps,
    frameCount,
    loadingError,
    noFaceDetected,
    startCamera,
    stopCamera,
  } = useFaceAnalysis()

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-200 font-mono">
      {/* Header */}
      <header className="border-b border-[#1a2744] bg-[#0d1425]/80 backdrop-blur px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-2 border-cyan-400 rounded rotate-45" />
            <div className="absolute inset-2 bg-cyan-400/20 rounded-sm rotate-45" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-cyan-400 tracking-wider uppercase">FaceAnalyzer AI</h1>
            <p className="text-[9px] text-slate-600 tracking-widest">GERÇEK ZAMANLI YÜZ ANALİZ SİSTEMİ v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {modelsLoaded && (
            <div className="flex items-center gap-1.5 text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 pulsing-dot" />
              <span className="text-green-400">4 Model Aktif</span>
            </div>
          )}
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-600">
            <span>face-api.js</span>
            <span className="text-slate-700">+</span>
            <span>TensorFlow.js</span>
          </div>
        </div>
      </header>

      {loadingError && (
        <div className="bg-red-900/30 border-b border-red-800/50 px-6 py-2 text-[11px] text-red-400">
          ⚠ {loadingError}
        </div>
      )}

      {/* Main */}
      <main className="flex gap-4 p-4" style={{ height: 'calc(100vh - 57px)' }}>
        {/* Left: Camera + Controls + Model Info */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Camera Feed */}
          <div className="flex-1 panel-bg cyber-border rounded-xl overflow-hidden relative min-h-0">
            <div className="corner-tl" />
            <div className="corner-tr" />
            <div className="corner-bl" />
            <div className="corner-br" />
            {cameraActive && <div className="scan-line" />}

            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ transform: 'scaleX(-1)', pointerEvents: 'none' }}
            />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full rotate-slow" />
                  <div className="absolute inset-3 border border-cyan-400/15 rounded-full" style={{ animation: 'rotateSlow 5s linear infinite reverse' }} />
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

            {/* HUD Labels */}
            {cameraActive && (
              <>
                <div className="absolute top-3 left-3 text-[9px] text-cyan-400/60 space-y-0.5 pointer-events-none">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 pulsing-dot" />
                    <span>REC</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3 text-[9px] text-cyan-400/60 text-right pointer-events-none">
                  <div>{fps} FPS</div>
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

          {/* Controls */}
          <div className="flex gap-3 shrink-0">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                disabled={!modelsLoaded}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30
                  hover:border-cyan-400 hover:shadow-[0_0_20px_#00d4ff22]"
              >
                {modelsLoaded ? '▶  KAMERAYI BAŞLAT' : '⟳  MODELLER YÜKLENİYOR...'}
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200
                  bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30
                  hover:border-red-400 hover:shadow-[0_0_20px_#ff336622]"
              >
                ■  DURDUR
              </button>
            )}
          </div>

          {/* Model Status Row */}
          <div className="panel-bg cyber-border rounded-xl p-3 grid grid-cols-4 gap-2 shrink-0">
            {[
              { name: 'SSD MobileNet v1', role: 'Yüz Tespiti', color: '#00d4ff' },
              { name: 'Landmark 68', role: '68 Nokta', color: '#7b2fff' },
              { name: 'Expression Net', role: '7 Duygu', color: '#ffcc00' },
              { name: 'Age/Gender', role: 'Yaş & Cinsiyet', color: '#00ff9d' },
            ].map(m => (
              <div key={m.name} className="text-center space-y-1.5">
                <div className="text-[9px] font-semibold tracking-wide" style={{ color: m.color }}>{m.name}</div>
                <div className="text-[9px] text-slate-600">{m.role}</div>
                <div
                  className={`w-2 h-2 rounded-full mx-auto ${modelsLoaded ? 'pulsing-dot' : ''}`}
                  style={{ backgroundColor: modelsLoaded ? m.color : '#374151' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Analysis Panel */}
        <div className="w-[300px] shrink-0 overflow-y-auto">
          <AnalysisPanel
            result={result}
            noFace={noFaceDetected}
            fps={fps}
            frameCount={frameCount}
            modelsLoaded={modelsLoaded}
            cameraActive={cameraActive}
          />
        </div>
      </main>
    </div>
  )
}
