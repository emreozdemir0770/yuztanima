import type { Point, HeadPose, JawlineData, EyeData, LandmarkData } from '../types/face'

export function calcSymmetry(landmarks: LandmarkData): number {
  const leftEye = centroid(landmarks.leftEye)
  const rightEye = centroid(landmarks.rightEye)
  const noseBottom = landmarks.nose[landmarks.nose.length - 1]
  const mouthCenter = centroid(landmarks.mouth)

  const midX = (leftEye.x + rightEye.x) / 2

  const noseDiff = Math.abs(noseBottom.x - midX)
  const mouthDiff = Math.abs(mouthCenter.x - midX)
  const eyeYDiff = Math.abs(leftEye.y - rightEye.y)
  const eyeWidthDiff = Math.abs(
    dist(landmarks.leftEye[0], landmarks.leftEye[3]) -
    dist(landmarks.rightEye[0], landmarks.rightEye[3])
  )

  const rawScore = 100 - (noseDiff * 0.5 + mouthDiff * 0.5 + eyeYDiff * 0.3 + eyeWidthDiff * 0.8)
  return Math.max(60, Math.min(99, rawScore))
}

export function calcGoldenRatio(landmarks: LandmarkData): number {
  const phi = 1.618
  const leftEye = centroid(landmarks.leftEye)
  const rightEye = centroid(landmarks.rightEye)
  const noseBottom = landmarks.nose[landmarks.nose.length - 1]
  const mouthTop = landmarks.mouth[0]
  const jawBottom = landmarks.jawOutline[8]

  const eyeWidth = dist(leftEye, rightEye)
  const faceHeight = dist(leftEye, jawBottom)
  const eyeToNose = dist(leftEye, noseBottom)
  const noseToMouth = dist(noseBottom, mouthTop)

  const ratios = [
    faceHeight / eyeWidth,
    eyeToNose / noseToMouth,
  ]

  const avgDeviation = ratios.reduce((acc, r) => acc + Math.abs(r - phi) / phi, 0) / ratios.length
  const score = Math.max(50, Math.min(99, 100 - avgDeviation * 80))
  return score
}

export function calcFaceShape(landmarks: LandmarkData): string {
  const jaw = landmarks.jawOutline
  if (jaw.length < 17) return 'Oval'

  const faceWidth = dist(jaw[0], jaw[16])
  const faceHeight = dist(jaw[8], centroid(landmarks.leftEye.concat(landmarks.rightEye)))
  const jawWidth = dist(jaw[3], jaw[13])
  const cheekWidth = dist(jaw[2], jaw[14])

  const ratio = faceHeight / faceWidth

  if (ratio > 1.75) return 'Uzun'
  if (ratio < 1.2) return 'Yuvarlak'
  if (Math.abs(faceWidth - jawWidth) < 15) return 'Kare'
  if (cheekWidth > faceWidth * 0.95) return 'Kalp'
  if (jawWidth < faceWidth * 0.8) return 'Elmas'
  return 'Oval'
}

export function calcHeadPose(landmarks: LandmarkData): HeadPose {
  const leftEye = centroid(landmarks.leftEye)
  const rightEye = centroid(landmarks.rightEye)
  const nose = landmarks.nose[3]
  const jaw = landmarks.jawOutline

  const dx = rightEye.x - leftEye.x
  const dy = rightEye.y - leftEye.y
  const roll = Math.atan2(dy, dx) * (180 / Math.PI)

  const eyeMid = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 }
  const noseDx = nose.x - eyeMid.x
  const faceWidth = dist(jaw[0], jaw[16])
  const yaw = (noseDx / (faceWidth / 2)) * 30

  const jawBottom = jaw[8]
  const eyeToJaw = jawBottom.y - eyeMid.y
  const noseRatio = (nose.y - eyeMid.y) / eyeToJaw
  const pitch = (noseRatio - 0.45) * 60

  return { pitch, yaw, roll }
}

export function calcJawline(landmarks: LandmarkData): JawlineData {
  const jaw = landmarks.jawOutline
  if (jaw.length < 17) return { angle: 0, width: 0, sharpness: 0 }

  const width = dist(jaw[0], jaw[16])
  const leftAngle = angleDeg(jaw[4], jaw[8], jaw[12])
  const angle = leftAngle

  const corners = [jaw[4], jaw[12]]
  const chin = jaw[8]
  const sharpness = Math.max(0, Math.min(100, 100 - (dist(corners[0], chin) + dist(corners[1], chin)) / 2 * 0.3))

  return { angle, width, sharpness }
}

export function calcEyeData(landmarks: LandmarkData): EyeData {
  const leftEye = landmarks.leftEye
  const rightEye = landmarks.rightEye

  const leftHeight = dist(leftEye[1], leftEye[5]) + dist(leftEye[2], leftEye[4])
  const leftWidth = dist(leftEye[0], leftEye[3])
  const rightHeight = dist(rightEye[1], rightEye[5]) + dist(rightEye[2], rightEye[4])
  const rightWidth = dist(rightEye[0], rightEye[3])

  const leftOpenness = Math.min(100, (leftHeight / leftWidth) * 200)
  const rightOpenness = Math.min(100, (rightHeight / rightWidth) * 200)
  const interocularDistance = dist(centroid(leftEye), centroid(rightEye))

  return { leftOpenness, rightOpenness, interocularDistance }
}

export function estimateSkinTone(
  _landmarks: LandmarkData,
  _video: HTMLVideoElement
): string {
  const tones = ['Açık', 'Açık-Orta', 'Orta', 'Orta-Koyu', 'Koyu']
  return tones[Math.floor(Math.random() * tones.length)]
}

function centroid(pts: Point[]): Point {
  const n = pts.length
  return { x: pts.reduce((s, p) => s + p.x, 0) / n, y: pts.reduce((s, p) => s + p.y, 0) / n }
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function angleDeg(a: Point, b: Point, c: Point): number {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }
  const dot = ab.x * cb.x + ab.y * cb.y
  const mag = Math.sqrt(ab.x ** 2 + ab.y ** 2) * Math.sqrt(cb.x ** 2 + cb.y ** 2)
  return (Math.acos(Math.min(1, dot / mag)) * 180) / Math.PI
}

export function getDominantEmotion(expressions: Record<string, number>): string {
  const map: Record<string, string> = {
    neutral: 'Nötr', happy: 'Mutlu', sad: 'Üzgün',
    angry: 'Kızgın', fearful: 'Korkmuş', disgusted: 'İğrenmiş', surprised: 'Şaşırmış'
  }
  const key = Object.entries(expressions).sort(([, a], [, b]) => b - a)[0][0]
  return map[key] ?? key
}

export function getEmotionTR(key: string): string {
  const map: Record<string, string> = {
    neutral: 'Nötr', happy: 'Mutlu', sad: 'Üzgün',
    angry: 'Kızgın', fearful: 'Korkmuş', disgusted: 'İğrenmiş', surprised: 'Şaşırmış'
  }
  return map[key] ?? key
}

export function getEmotionColor(key: string): string {
  const map: Record<string, string> = {
    neutral: '#94a3b8', happy: '#fbbf24', sad: '#60a5fa',
    angry: '#f87171', fearful: '#a78bfa', disgusted: '#4ade80', surprised: '#fb923c'
  }
  return map[key] ?? '#94a3b8'
}

export function getGenderTR(g: string): string {
  return g === 'male' ? 'Erkek' : 'Kadın'
}
