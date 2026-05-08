import { useEffect, useRef, useState, useCallback } from 'react'
import type { BioTaxonomy } from '../utils/taxonomy'
import { getTaxonomy } from '../utils/taxonomy'

export interface DetectedCreature {
  id: number
  label: string          // Raw label from coco-ssd
  mobileNetLabel: string // Refined label from mobilenet
  score: number
  bbox: [number, number, number, number]  // [x, y, w, h] in video coords
  taxonomy: BioTaxonomy | null
}

type CocoModel = { detect: (img: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => Promise<Array<{ class: string; score: number; bbox: [number,number,number,number] }>> }
type MobileNetModel = { classify: (img: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, topk?: number) => Promise<Array<{ className: string; probability: number }>> }

const DETECT_INTERVAL = 20   // run coco-ssd every N frames
const MOBILENET_SIZE = 96    // px — crop size for mobilenet per-region classification

export function useCreatureDetection() {
  const [creaturesLoaded, setCreaturesLoaded] = useState(false)
  const [creatures, setCreatures] = useState<DetectedCreature[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const cocoRef = useRef<CocoModel | null>(null)
  const mnetRef = useRef<MobileNetModel | null>(null)
  const frameRef = useRef(0)
  const busyRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [cocoSsd, mobilenet] = await Promise.all([
          import('@tensorflow-models/coco-ssd'),
          import('@tensorflow-models/mobilenet'),
        ])
        const [coco, mnet] = await Promise.all([
          cocoSsd.load(),
          mobilenet.load({ version: 2, alpha: 0.5 }),
        ])
        if (!cancelled) {
          cocoRef.current = coco as unknown as CocoModel
          mnetRef.current = mnet as unknown as MobileNetModel
          setCreaturesLoaded(true)
        }
      } catch (e) {
        if (!cancelled) setLoadError('Canlı tespit modelleri yüklenemedi: ' + (e as Error).message)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const detectFrame = useCallback(async (source: HTMLVideoElement | HTMLCanvasElement) => {
    if (!cocoRef.current || !mnetRef.current || busyRef.current) return
    frameRef.current++
    if (frameRef.current % DETECT_INTERVAL !== 0) return

    busyRef.current = true
    try {
      const rawDetections = await cocoRef.current.detect(source as HTMLVideoElement)

      // Filter to living creatures only
      const LIVING = new Set([
        'person', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
        'elephant', 'bear', 'zebra', 'giraffe',
      ])
      const living = rawDetections.filter(d => LIVING.has(d.class) && d.score > 0.45)

      if (living.length === 0) {
        setCreatures([])
        return
      }

      const srcWidth = source instanceof HTMLVideoElement ? source.videoWidth : source.width
      const srcHeight = source instanceof HTMLVideoElement ? source.videoHeight : source.height

      const results: DetectedCreature[] = await Promise.all(
        living.slice(0, 4).map(async (d, i) => {
          // Crop region for MobileNet classification
          const [bx, by, bw, bh] = d.bbox
          const temp = document.createElement('canvas')
          temp.width = MOBILENET_SIZE
          temp.height = MOBILENET_SIZE
          const ctx = temp.getContext('2d')!
          const sx = Math.max(0, bx)
          const sy = Math.max(0, by)
          const sw = Math.min(bw, srcWidth - sx)
          const sh = Math.min(bh, srcHeight - sy)
          ctx.drawImage(source, sx, sy, sw, sh, 0, 0, MOBILENET_SIZE, MOBILENET_SIZE)

          let mobileNetLabel = d.class
          try {
            const preds = await mnetRef.current!.classify(temp, 3)
            if (preds[0] && preds[0].probability > 0.15) {
              mobileNetLabel = preds[0].className
            }
          } catch (_) { /* keep coco label */ }

          // Try mobilenet label first for finer taxonomy, fallback to coco
          const taxonomy = getTaxonomy(mobileNetLabel) ?? getTaxonomy(d.class)

          return {
            id: i,
            label: d.class,
            mobileNetLabel,
            score: d.score,
            bbox: d.bbox,
            taxonomy,
          }
        })
      )

      setCreatures(results)
    } catch (_) { /* ignore frame errors */ } finally {
      busyRef.current = false
    }
  }, [])

  const detectImage = useCallback(async (canvas: HTMLCanvasElement): Promise<DetectedCreature[]> => {
    if (!cocoRef.current || !mnetRef.current) return []
    try {
      const rawDetections = await cocoRef.current.detect(canvas)
      const LIVING = new Set(['person','bird','cat','dog','horse','sheep','cow','elephant','bear','zebra','giraffe'])
      const living = rawDetections.filter(d => LIVING.has(d.class) && d.score > 0.25)

      if (living.length === 0) {
        // Fallback: run MobileNet on full image, try all top predictions for a taxonomy match
        const preds = await mnetRef.current.classify(canvas, 10)
        for (const pred of preds) {
          if (pred.probability < 0.08) break
          const taxonomy = getTaxonomy(pred.className)
          if (taxonomy) {
            return [{
              id: 0, label: pred.className, mobileNetLabel: pred.className,
              score: pred.probability, bbox: [0, 0, canvas.width, canvas.height],
              taxonomy,
            }]
          }
        }
        return []
      }

      const srcW = canvas.width
      const srcH = canvas.height

      return await Promise.all(living.slice(0, 6).map(async (d, i) => {
        const [bx, by, bw, bh] = d.bbox
        const temp = document.createElement('canvas')
        temp.width = MOBILENET_SIZE; temp.height = MOBILENET_SIZE
        const ctx = temp.getContext('2d')!
        ctx.drawImage(canvas, Math.max(0,bx), Math.max(0,by), Math.min(bw,srcW-bx), Math.min(bh,srcH-by), 0, 0, MOBILENET_SIZE, MOBILENET_SIZE)

        let mobileNetLabel = d.class
        try {
          const preds = await mnetRef.current!.classify(temp, 3)
          if (preds[0]?.probability > 0.15) mobileNetLabel = preds[0].className
        } catch (_) {}

        return {
          id: i, label: d.class, mobileNetLabel,
          score: d.score, bbox: d.bbox,
          taxonomy: getTaxonomy(mobileNetLabel) ?? getTaxonomy(d.class),
        }
      }))
    } catch { return [] }
  }, [])

  const reset = useCallback(() => setCreatures([]), [])

  return { creaturesLoaded, creatures, loadError, detectFrame, detectImage, reset }
}
