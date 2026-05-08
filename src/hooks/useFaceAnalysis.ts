import { useEffect, useRef, useState, useCallback } from 'react'
import * as faceapi from '@vladmandic/face-api'
import type {
  FaceAnalysisResult, LandmarkData, Point,
  ExpressionScores, OverlaySettings, TrackedFace,
} from '../types/face'
import {
  calcSymmetry, calcGoldenRatio, calcFaceShape,
  calcHeadPose, calcJawline, calcEyeData,
} from '../utils/faceUtils'

const MODEL_URL = '/models'
const FACE_COLORS = ['#00d4ff', '#00ff9d', '#ffcc00', '#7b2fff']
const MAX_HISTORY = 80

export const DEFAULT_OVERLAY: OverlaySettings = {
  showLandmarks: true,
  showBox: true,
  showSymmetryAxis: true,
  showLabel: true,
}

type DetectFrameFn = (source: HTMLVideoElement | HTMLCanvasElement) => Promise<void>

export function useFaceAnalysis(detectFrame?: DetectFrameFn) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const settingsRef = useRef<OverlaySettings>(DEFAULT_OVERLAY)
  const emotionHistoryRef = useRef<ExpressionScores[]>([])
  const frameRef = useRef(0)

  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [result, setResult] = useState<FaceAnalysisResult | null>(null)
  const [allFaces, setAllFaces] = useState<TrackedFace[]>([])
  const [emotionHistory, setEmotionHistory] = useState<ExpressionScores[]>([])
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(DEFAULT_OVERLAY)
  const [fps, setFps] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [noFaceDetected, setNoFaceDetected] = useState(false)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [activeCameraId, setActiveCameraId] = useState<string | undefined>(undefined)

  const fpsRef = useRef({ count: 0, last: Date.now() })

  useEffect(() => { settingsRef.current = overlaySettings }, [overlaySettings])

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

  const enumerateCameras = useCallback(async () => {
    try {
      // Request permission first so labels are populated
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
      tempStream.getTracks().forEach(t => t.stop())
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      setCameras(videoDevices)
      return videoDevices
    } catch {
      setCameras([])
      return []
    }
  }, [])

  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      const videoConstraints: MediaTrackConstraints = deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: 640 }, height: { ideal: 480 } }
        : { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }

      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraActive(true)
        setActiveCameraId(deviceId)

        // Refresh camera list after permission granted
        const devices = await navigator.mediaDevices.enumerateDevices()
        setCameras(devices.filter(d => d.kind === 'videoinput'))
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
    setAllFaces([])
    setEmotionHistory([])
    emotionHistoryRef.current = []
    frameRef.current = 0
    const canvas = canvasRef.current
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
  }, [])

  const takeSnapshot = useCallback((): string | null => {
    const video = videoRef.current
    const overlay = canvasRef.current
    if (!video || !overlay || video.readyState < 2) return null
    const w = overlay.width || video.clientWidth
    const h = overlay.height || video.clientHeight
    if (!w || !h) return null
    const temp = document.createElement('canvas')
    temp.width = w
    temp.height = h
    const ctx = temp.getContext('2d')!
    ctx.translate(w, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, w, h)
    ctx.drawImage(overlay, 0, 0, w, h)
    return temp.toDataURL('image/jpeg', 0.85)
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
    const s = settingsRef.current
    const scaleX = canvas.width / video.videoWidth
    const scaleY = canvas.height / video.videoHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    detections.forEach((d, idx) => {
      const color = FACE_COLORS[idx % FACE_COLORS.length]
      const box = d.detection.box
      const x = box.x * scaleX
      const y = box.y * scaleY
      const w = box.width * scaleX
      const h = box.height * scaleY

      if (s.showBox) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.setLineDash([6, 3])
        ctx.strokeRect(x, y, w, h)
        ctx.setLineDash([])

        const cs = 18
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
      }

      if (s.showLandmarks) {
        const pts = d.landmarks.positions
        const groups = [
          { pts: pts.slice(0, 17), lc: color + '66', dc: color + 'aa' },
          { pts: pts.slice(17, 22), lc: '#7b2fff88', dc: '#7b2fffcc' },
          { pts: pts.slice(22, 27), lc: '#7b2fff88', dc: '#7b2fffcc' },
          { pts: pts.slice(27, 36), lc: '#00ff9d88', dc: '#00ff9dcc' },
          { pts: pts.slice(36, 42), lc: '#ffcc0088', dc: '#ffcc00cc' },
          { pts: pts.slice(42, 48), lc: '#ffcc0088', dc: '#ffcc00cc' },
          { pts: pts.slice(48, 68), lc: '#ff336688', dc: '#ff3366cc' },
        ]
        for (const g of groups) {
          if (g.pts.length < 2) continue
          ctx.strokeStyle = g.lc
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(g.pts[0].x * scaleX, g.pts[0].y * scaleY)
          for (let i = 1; i < g.pts.length; i++) ctx.lineTo(g.pts[i].x * scaleX, g.pts[i].y * scaleY)
          ctx.stroke()
          ctx.fillStyle = g.dc
          for (const pt of g.pts) {
            ctx.beginPath()
            ctx.arc(pt.x * scaleX, pt.y * scaleY, 1.5, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      if (s.showSymmetryAxis) {
        const pts = d.landmarks.positions
        const noseBridge = pts[27]
        const chin = pts[8]
        ctx.strokeStyle = color + '33'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(noseBridge.x * scaleX, y)
        ctx.lineTo(chin.x * scaleX, y + h)
        ctx.stroke()
        ctx.setLineDash([])
      }

      if (s.showLabel) {
        const label = `${Math.round(d.age)}y ${d.gender === 'male' ? '♂' : '♀'}`
        ctx.fillStyle = color + 'cc'
        ctx.fillRect(x, y - 18, label.length * 7 + 8, 16)
        ctx.fillStyle = '#000'
        ctx.font = 'bold 10px monospace'
        ctx.fillText(label, x + 4, y - 5)
      }
    })
  }, [])

  function buildFaceResult(
    d: faceapi.WithFaceLandmarks<
      faceapi.WithFaceExpressions<faceapi.WithAge<faceapi.WithGender<{ detection: faceapi.FaceDetection }>>>
    >,
    color: string,
    index: number
  ): TrackedFace {
    const rawPts = d.landmarks.positions
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
    const box = d.detection.box
    return {
      age: Math.round(d.age),
      gender: d.gender,
      genderProbability: d.genderProbability,
      expressions: d.expressions as unknown as ExpressionScores,
      landmarks,
      faceBox: { x: box.x, y: box.y, width: box.width, height: box.height },
      symmetryScore: calcSymmetry(landmarks),
      faceShape: calcFaceShape(landmarks),
      goldenRatioScore: calcGoldenRatio(landmarks),
      skinTone: 'Orta',
      headPose: calcHeadPose(landmarks),
      jawline: calcJawline(landmarks),
      eyeData: calcEyeData(landmarks),
      faceWidth: box.width,
      faceHeight: box.height,
      color,
      index,
    }
  }

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

        frameRef.current++
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

          const sorted = [...detections].sort((a, b) => b.detection.box.area - a.detection.box.area)
          const faces = sorted.slice(0, 4).map((d, i) =>
            buildFaceResult(d, FACE_COLORS[i % FACE_COLORS.length], i)
          )

          setAllFaces(faces)
          setResult(faces[0])

          // Update emotion history every 3 frames
          if (frameRef.current % 3 === 0) {
            const entry = faces[0].expressions
            emotionHistoryRef.current = [...emotionHistoryRef.current.slice(-(MAX_HISTORY - 1)), entry]
            setEmotionHistory([...emotionHistoryRef.current])
          }
        } else {
          setNoFaceDetected(true)
          setAllFaces([])
          canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
        }
      } catch (_e) { /* ignore frame errors */ }

      // Creature detection (throttled inside the hook)
      if (detectFrame && video.readyState >= 2) {
        detectFrame(video).catch(() => {})
      }

      animFrameRef.current = requestAnimationFrame(detect)
    }

    animFrameRef.current = requestAnimationFrame(detect)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [cameraActive, modelsLoaded, drawOverlay, detectFrame])

  return {
    videoRef, canvasRef,
    modelsLoaded, cameraActive,
    result, allFaces,
    emotionHistory,
    overlaySettings, setOverlaySettings,
    fps, frameCount,
    loadingError, noFaceDetected,
    cameras, activeCameraId,
    startCamera, stopCamera, takeSnapshot, enumerateCameras,
  }
}
