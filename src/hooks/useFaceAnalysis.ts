import { useEffect, useRef, useState, useCallback } from 'react'
import * as faceapi from 'face-api.js'
import type { FaceAnalysisResult, LandmarkData, Point } from '../types/face'
import {
  calcSymmetry, calcGoldenRatio, calcFaceShape,
  calcHeadPose, calcJawline, calcEyeData
} from '../utils/faceUtils'

const MODEL_URL = '/models'

export function useFaceAnalysis() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [result, setResult] = useState<FaceAnalysisResult | null>(null)
  const [fps, setFps] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [noFaceDetected, setNoFaceDetected] = useState(false)

  const fpsRef = useRef({ count: 0, last: Date.now() })

  useEffect(() => {
    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ])
        setModelsLoaded(true)
      } catch (e) {
        setLoadingError('Model yüklenemedi: ' + (e as Error).message)
      }
    }
    loadModels()
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
      }
    } catch (e) {
      setLoadingError('Kamera erişimi reddedildi: ' + (e as Error).message)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    cancelAnimationFrame(animFrameRef.current)
    setCameraActive(false)
    setResult(null)
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [])

  const drawOverlay = useCallback((
    detections: faceapi.WithFaceLandmarks<
      faceapi.WithFaceExpressions<faceapi.WithAge<faceapi.WithGender<{ detection: faceapi.FaceDetection }>>>
    >[],
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement
  ) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = canvas.width / video.videoWidth
    const scaleY = canvas.height / video.videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const d of detections) {
      const box = d.detection.box
      const x = box.x * scaleX
      const y = box.y * scaleY
      const w = box.width * scaleX
      const h = box.height * scaleY

      // Face bounding box
      ctx.strokeStyle = '#00d4ff'
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 3])
      ctx.strokeRect(x, y, w, h)
      ctx.setLineDash([])

      // Corner marks
      const cs = 18
      ctx.strokeStyle = '#00d4ff'
      ctx.lineWidth = 2.5
      for (const [cx, cy, dx, dy] of [
        [x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]
      ] as [number, number, number, number][]) {
        ctx.beginPath()
        ctx.moveTo(cx + dx * cs, cy)
        ctx.lineTo(cx, cy)
        ctx.lineTo(cx, cy + dy * cs)
        ctx.stroke()
      }

      // Landmarks
      const pts = d.landmarks.positions
      const groups = [
        { pts: pts.slice(0, 17), color: '#00d4ff88', dot: '#00d4ffcc' },  // jaw
        { pts: pts.slice(17, 22), color: '#7b2fff88', dot: '#7b2fffcc' }, // left brow
        { pts: pts.slice(22, 27), color: '#7b2fff88', dot: '#7b2fffcc' }, // right brow
        { pts: pts.slice(27, 36), color: '#00ff9d88', dot: '#00ff9dcc' }, // nose
        { pts: pts.slice(36, 42), color: '#ffcc0088', dot: '#ffcc00cc' }, // left eye
        { pts: pts.slice(42, 48), color: '#ffcc0088', dot: '#ffcc00cc' }, // right eye
        { pts: pts.slice(48, 68), color: '#ff336688', dot: '#ff3366cc' }, // mouth
      ]

      for (const g of groups) {
        if (g.pts.length < 2) continue
        ctx.strokeStyle = g.color
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(g.pts[0].x * scaleX, g.pts[0].y * scaleY)
        for (let i = 1; i < g.pts.length; i++) {
          ctx.lineTo(g.pts[i].x * scaleX, g.pts[i].y * scaleY)
        }
        ctx.stroke()

        ctx.fillStyle = g.dot
        for (const pt of g.pts) {
          ctx.beginPath()
          ctx.arc(pt.x * scaleX, pt.y * scaleY, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Center line (symmetry axis)
      const noseBridge = pts[27]
      const chinCenter = pts[8]
      ctx.strokeStyle = '#00d4ff33'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(noseBridge.x * scaleX, y)
      ctx.lineTo(chinCenter.x * scaleX, y + h)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [])

  useEffect(() => {
    if (!cameraActive || !modelsLoaded) return

    async function detect() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect)
        return
      }

      canvas.width = video.clientWidth
      canvas.height = video.clientHeight

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceExpressions()
          .withAgeAndGender()

        fpsRef.current.count++
        setFrameCount(c => c + 1)

        const now = Date.now()
        if (now - fpsRef.current.last >= 1000) {
          setFps(fpsRef.current.count)
          fpsRef.current.count = 0
          fpsRef.current.last = now
        }

        if (detections.length > 0) {
          setNoFaceDetected(false)
          drawOverlay(detections, canvas, video)

          const best = detections.sort((a, b) =>
            b.detection.box.area - a.detection.box.area
          )[0]

          const rawPts = best.landmarks.positions
          const pts: Point[] = rawPts.map(p => ({ x: p.x, y: p.y }))

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
          const faceWidth = box.width
          const faceHeight = box.height

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
            faceWidth,
            faceHeight,
          })
        } else {
          setNoFaceDetected(true)
          const ctx = canvas.getContext('2d')
          ctx?.clearRect(0, 0, canvas.width, canvas.height)
        }
      } catch (_e) {
        // ignore frame errors
      }

      animFrameRef.current = requestAnimationFrame(detect)
    }

    animFrameRef.current = requestAnimationFrame(detect)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [cameraActive, modelsLoaded, drawOverlay])

  return {
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
  }
}
