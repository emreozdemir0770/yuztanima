import { openDB, type IDBPDatabase } from 'idb'
import type { FaceAnalysisResult } from '../types/face'
import type { DetectedCreature } from '../hooks/useCreatureDetection'
import { getDominantEmotion, getEmotionTR, getGenderTR } from '../utils/faceUtils'

export interface FaceReport {
  id?: number
  timestamp: number
  imageSnapshot: string | null
  analysisMode: 'video' | 'image'
  result: FaceAnalysisResult
  overallScore: number
  insights: string[]
  creatures?: DetectedCreature[]
}

const DB_NAME = 'faceanalyzer'
const STORE = 'reports'

let _db: IDBPDatabase | null = null

async function getDB() {
  if (_db) return _db
  _db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      store.createIndex('timestamp', 'timestamp')
    },
  })
  return _db
}

export async function saveReport(report: Omit<FaceReport, 'id'>): Promise<number> {
  const db = await getDB()
  return db.add(STORE, report) as Promise<number>
}

export async function getAllReports(): Promise<FaceReport[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex(STORE, 'timestamp')
  return (all as FaceReport[]).reverse()
}

export async function getReport(id: number): Promise<FaceReport | undefined> {
  const db = await getDB()
  return db.get(STORE, id) as Promise<FaceReport | undefined>
}

export async function deleteReport(id: number): Promise<void> {
  const db = await getDB()
  return db.delete(STORE, id)
}

export async function clearAllReports(): Promise<void> {
  const db = await getDB()
  return db.clear(STORE)
}

export function buildReport(
  result: FaceAnalysisResult,
  imageSnapshot: string | null,
  analysisMode: 'video' | 'image',
  creatures?: DetectedCreature[]
): Omit<FaceReport, 'id'> {
  const overallScore = calcOverallScore(result)
  const insights = buildInsights(result)
  return {
    timestamp: Date.now(),
    imageSnapshot,
    analysisMode,
    result,
    overallScore,
    insights,
    ...(creatures && creatures.length > 0 ? { creatures } : {}),
  }
}

function calcOverallScore(r: FaceAnalysisResult): number {
  const weights = [
    r.symmetryScore * 0.35,
    r.goldenRatioScore * 0.30,
    r.genderProbability * 100 * 0.10,
    Math.min(100, r.eyeData.leftOpenness) * 0.10,
    Math.min(100, r.eyeData.rightOpenness) * 0.10,
    r.jawline.sharpness * 0.05,
  ]
  return Math.min(99, weights.reduce((a, b) => a + b, 0))
}

function buildInsights(r: FaceAnalysisResult): string[] {
  const list: string[] = []

  // Symmetry
  if (r.symmetryScore >= 90) list.push('Olağanüstü yüz simetrisi — üst %5 içinde')
  else if (r.symmetryScore >= 82) list.push('Yüksek yüz simetrisi tespit edildi')
  else if (r.symmetryScore < 75) list.push('Yüz simetrisi ortalamanın altında')

  // Golden ratio
  if (r.goldenRatioScore >= 88) list.push('Altın orana (φ=1.618) yakın yüz oranları')
  else if (r.goldenRatioScore >= 78) list.push('Yüz oranları altın orana yakın')

  // Face shape
  list.push(`Yüz şekli: ${r.faceShape} — ${faceShapeDesc(r.faceShape)}`)

  // Dominant emotion
  const dom = getDominantEmotion(r.expressions as unknown as Record<string, number>)
  list.push(`Baskın duygu durumu: ${dom}`)

  // Head pose
  if (Math.abs(r.headPose.yaw) > 15) list.push(`Baş ${r.headPose.yaw > 0 ? 'sağa' : 'sola'} dönük (${Math.abs(r.headPose.yaw).toFixed(1)}°)`)
  if (Math.abs(r.headPose.roll) > 8) list.push(`Hafif baş eğimi tespit edildi (${r.headPose.roll.toFixed(1)}°)`)

  // Eye openness
  const avgEye = (r.eyeData.leftOpenness + r.eyeData.rightOpenness) / 2
  if (avgEye > 75) list.push('Gözler tam açık — ideal analiz koşulları')
  else if (avgEye < 40) list.push('Gözler kısmen kapalı — analiz hassasiyeti düşebilir')

  // Age/Gender
  list.push(`Tahmini yaş: ${r.age} — Cinsiyet: ${getGenderTR(r.gender)} (%${Math.round(r.genderProbability * 100)} güven)`)

  return list
}

function faceShapeDesc(shape: string): string {
  const map: Record<string, string> = {
    'Oval': 'en dengeli ve estetik kabul edilen şekil',
    'Yuvarlak': 'dolgun yanaklar ve yumuşak hatlar',
    'Kare': 'güçlü çene hattı ve belirgin köşeler',
    'Kalp': 'geniş alın ve sivri çene',
    'Elmas': 'belirgin elmacık kemikleri',
    'Uzun': 'dikey uzunluğu ön plana çıkan yapı',
  }
  return map[shape] ?? ''
}
