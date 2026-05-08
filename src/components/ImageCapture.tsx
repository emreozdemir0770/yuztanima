import { useRef, useState, useCallback, useEffect } from 'react'
import { useImageAnalysis } from '../hooks/useImageAnalysis'
import AnalysisPanel from './AnalysisPanel'
import CreaturePanel from './CreaturePanel'
import { buildReport, saveReport } from '../db/faceDB'
import type { DetectedCreature } from '../hooks/useCreatureDetection'

interface Props {
  modelsLoaded: boolean
  onReportSaved?: () => void
  detectImage?: (canvas: HTMLCanvasElement) => Promise<DetectedCreature[]>
  creaturesLoaded?: boolean
}

export default function ImageCapture({ modelsLoaded, onReportSaved, detectImage, creaturesLoaded }: Props) {
  const { canvasRef, result, analyzing, imageSrc, noFace, error, analyze, reset } = useImageAnalysis()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedNotice, setSavedNotice] = useState(false)
  const [imageCreatures, setImageCreatures] = useState<DetectedCreature[]>([])

  useEffect(() => {
    if (!imageSrc) { setImageCreatures([]); return }
    if (analyzing || !detectImage) return
    // Use a clean canvas (no face landmark overlay) so MobileNet sees the raw image
    const img = new Image()
    img.onload = () => {
      const MAX_W = 640
      const scale = img.naturalWidth > MAX_W ? MAX_W / img.naturalWidth : 1
      const temp = document.createElement('canvas')
      temp.width = Math.round(img.naturalWidth * scale)
      temp.height = Math.round(img.naturalHeight * scale)
      temp.getContext('2d')!.drawImage(img, 0, 0, temp.width, temp.height)
      detectImage(temp).then(setImageCreatures).catch(() => {})
    }
    img.src = imageSrc
  }, [imageSrc, analyzing, detectImage])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setSavedNotice(false)
    analyze(file)
  }, [analyze])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleSaveReport = useCallback(async () => {
    if (!result || !canvasRef.current) return
    setSaving(true)
    try {
      const snapshot = canvasRef.current.toDataURL('image/jpeg', 0.75)
      const report = buildReport(result, snapshot, 'image', imageCreatures.length > 0 ? imageCreatures : undefined)
      await saveReport(report)
      onReportSaved?.()
      setSavedNotice(true)
      setTimeout(() => setSavedNotice(false), 2500)
    } finally {
      setSaving(false)
    }
  }, [result, canvasRef, onReportSaved])

  return (
    <div className="flex gap-4 h-full">
      {/* Image + Canvas Area */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div
          className={`flex-1 panel-bg rounded-xl overflow-hidden relative transition-all duration-200 min-h-0
            ${dragging ? 'border-2 border-cyan-400 shadow-[0_0_30px_#00d4ff33]' : 'cyber-border'}
          `}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <div className="corner-tl" /><div className="corner-tr" />
          <div className="corner-bl" /><div className="corner-br" />

          {imageSrc ? (
            <div className="w-full h-full flex items-center justify-center bg-black/20 p-2">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              <div className={`transition-all duration-200 ${dragging ? 'scale-110' : ''}`}>
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-2 border-cyan-400/20 rounded-full rotate-slow" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-9 h-9 text-cyan-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-slate-400 text-xs tracking-wider">
                  {dragging ? 'BIRAK VE ANALİZ ET' : 'RESİM YÜKLE / SÜRÜKLE'}
                </p>
                <p className="text-slate-600 text-[10px]">JPG, PNG, WEBP desteklenir</p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="absolute inset-0 bg-[#0a0e1a]/80 flex flex-col items-center justify-center gap-3 z-20">
              <div className="scan-line" />
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 9 }).map((_, i) => <div key={i} className="loading-cell" />)}
              </div>
              <p className="text-cyan-400 text-xs tracking-widest animate-pulse">ANALİZ EDİLİYOR...</p>
            </div>
          )}

          {result && !analyzing && (
            <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[9px] pointer-events-none">
              <div className="bg-[#0d1425]/90 border border-[#1a2744] rounded px-2 py-1 text-cyan-400">
                YAŞ: {result.age} | {result.gender === 'male' ? 'ERKEK' : 'KADIN'}
              </div>
              <div className="bg-[#0d1425]/90 border border-[#1a2744] rounded px-2 py-1 text-cyan-400">
                SİMETRİ: %{Math.round(result.symmetryScore)}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 shrink-0">
          <button
            disabled={!modelsLoaded || analyzing}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
              bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30
              hover:border-cyan-400 hover:shadow-[0_0_20px_#00d4ff22]">
            {analyzing ? '⟳  ANALİZ EDİLİYOR...' : '↑  RESİM SEÇ'}
          </button>
          {imageSrc && (
            <button onClick={() => { reset(); setImageCreatures([]) }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-200
                bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 border border-slate-700/50 hover:border-slate-500">
              ✕
            </button>
          )}
        </div>

        {savedNotice && (
          <div className="panel-bg border border-green-800/40 rounded-xl px-4 py-2 text-[11px] text-green-400 shrink-0">
            ✓ Rapor başarıyla veritabanına kaydedildi
          </div>
        )}

        {(error || noFace) && (
          <div className={`panel-bg rounded-xl px-4 py-3 text-[11px] shrink-0 border ${
            noFace && imageCreatures.length > 0
              ? 'border-yellow-800/40 text-yellow-400'
              : 'border-red-800/40 text-red-400'
          }`}>
            {error ?? (
              noFace && imageCreatures.length > 0
                ? `İnsan yüzü bulunamadı — ${imageCreatures.length} canlı tespit edildi.`
                : 'Resimde yüz bulunamadı. Başka bir resim deneyin.'
            )}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>

      {/* Analysis Panel */}
      <div className="w-[300px] shrink-0 overflow-y-auto space-y-3">
        <AnalysisPanel
          result={result}
          noFace={noFace}
          fps={0}
          frameCount={0}
          modelsLoaded={modelsLoaded}
          cameraActive={!!imageSrc}
          onSaveReport={handleSaveReport}
          saving={saving}
        />
        <CreaturePanel creatures={imageCreatures} creaturesLoaded={creaturesLoaded ?? false} />
      </div>
    </div>
  )
}
