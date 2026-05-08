import { useRef, useState, useCallback } from 'react'
import * as faceapi from '@vladmandic/face-api'
import type { FaceAnalysisResult, LandmarkData, Point } from '../types/face'
import {
  calcSymmetry, calcGoldenRatio, calcFaceShape,
  calcHeadPose, calcJawline, calcEyeData,
} from '../utils/faceUtils'

export function useImageAnalysis() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [result, setResult] = useState<FaceAnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [noFace, setNoFace] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = useCallback(async (file: File) => {
    setError(null)
    setNoFace(false)
    setResult(null)
    setAnalyzing(true)

    const url = URL.createObjectURL(file)
    setImageSrc(url)

    try {
      const img = await loadImage(url)
      const canvas = canvasRef.current
      if (!canvas) return

      // Scale image to fit canvas (max 640px wide)
      const maxW = 640
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const detections = await faceapi
        .detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()

      if (detections.length === 0) {
        setNoFace(true)
        setAnalyzing(false)
        return
      }

      const best = detections.sort((a, b) => b.detection.box.area - a.detection.box.area)[0]

      // Redraw image then overlay
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      drawOverlay(ctx, best, scale)

      const rawPts = best.landmarks.positions
      const pts: Point[] = rawPts.map(p => ({ x: p.x * scale, y: p.y * scale }))

      const landmarks: LandmarkData = {
        jawOutline: pts.slice(0, 17),
        leftEyebrow: pts.slice(17, 22),
        rightEyebrow: pts.slice(22, 27),
        nose: pts.slice(27, 36),
        leftEye: pts.slice(36, 42),
        rightEye: pts.slice(42, 48),
        mouth: pts.slice(48, 68),
      }

      const box = best.detection.box

      setResult({
        age: Math.round(best.age),
        gender: best.gender,
        genderProbability: best.genderProbability,
        expressions: best.expressions as unknown as import('../types/face').ExpressionScores,
        landmarks,
        faceBox: { x: box.x, y: box.y, width: box.width, height: box.height },
        symmetryScore: calcSymmetry(landmarks),
        faceShape: calcFaceShape(landmarks),
        goldenRatioScore: calcGoldenRatio(landmarks),
        skinTone: 'Orta',
        headPose: calcHeadPose(landmarks),
        jawline: calcJawline(landmarks),
        eyeData: calcEyeData(landmarks),
        faceWidth: box.width * scale,
        faceHeight: box.height * scale,
      })
    } catch (e) {
      setError('Analiz hatası: ' + (e as Error).message)
    } finally {
      setAnalyzing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setImageSrc(null)
    setNoFace(false)
    setError(null)
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  return { canvasRef, result, analyzing, imageSrc, noFace, error, analyze, reset }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  d: faceapi.WithFaceLandmarks<
    faceapi.WithFaceExpressions<faceapi.WithAge<faceapi.WithGender<{ detection: faceapi.FaceDetection }>>>
  >,
  scale: number
) {
  const box = d.detection.box
  const x = box.x * scale
  const y = box.y * scale
  const w = box.width * scale
  const h = box.height * scale

  ctx.strokeStyle = '#00d4ff'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 3])
  ctx.strokeRect(x, y, w, h)
  ctx.setLineDash([])

  const cs = 16
  ctx.lineWidth = 2.5
  for (const [cx, cy, dx, dy] of [
    [x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1],
  ] as [number, number, number, number][]) {
    ctx.beginPath()
    ctx.moveTo(cx + dx * cs, cy)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx, cy + dy * cs)
    ctx.stroke()
  }

  const pts = d.landmarks.positions
  const groups = [
    { pts: pts.slice(0, 17), line: '#00d4ff88', dot: '#00d4ffcc' },
    { pts: pts.slice(17, 22), line: '#7b2fff88', dot: '#7b2fffcc' },
    { pts: pts.slice(22, 27), line: '#7b2fff88', dot: '#7b2fffcc' },
    { pts: pts.slice(27, 36), line: '#00ff9d88', dot: '#00ff9dcc' },
    { pts: pts.slice(36, 42), line: '#ffcc0088', dot: '#ffcc00cc' },
    { pts: pts.slice(42, 48), line: '#ffcc0088', dot: '#ffcc00cc' },
    { pts: pts.slice(48, 68), line: '#ff336688', dot: '#ff3366cc' },
  ]

  for (const g of groups) {
    if (g.pts.length < 2) continue
    ctx.strokeStyle = g.line
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(g.pts[0].x * scale, g.pts[0].y * scale)
    for (let i = 1; i < g.pts.length; i++) ctx.lineTo(g.pts[i].x * scale, g.pts[i].y * scale)
    ctx.stroke()

    ctx.fillStyle = g.dot
    for (const pt of g.pts) {
      ctx.beginPath()
      ctx.arc(pt.x * scale, pt.y * scale, 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Symmetry axis
  const noseBridge = pts[27]
  const chin = pts[8]
  ctx.strokeStyle = '#00d4ff33'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(noseBridge.x * scale, y)
  ctx.lineTo(chin.x * scale, y + h)
  ctx.stroke()
  ctx.setLineDash([])
}
