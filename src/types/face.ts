export interface FaceAnalysisResult {
  age: number
  gender: string
  genderProbability: number
  expressions: ExpressionScores
  landmarks: LandmarkData
  faceBox: FaceBox
  symmetryScore: number
  faceShape: string
  goldenRatioScore: number
  skinTone: string
  headPose: HeadPose
  jawline: JawlineData
  eyeData: EyeData
  faceWidth: number
  faceHeight: number
}

export interface ExpressionScores {
  neutral: number
  happy: number
  sad: number
  angry: number
  fearful: number
  disgusted: number
  surprised: number
}

export interface LandmarkData {
  jawOutline: Point[]
  nose: Point[]
  leftEye: Point[]
  rightEye: Point[]
  leftEyebrow: Point[]
  rightEyebrow: Point[]
  mouth: Point[]
}

export interface FaceBox {
  x: number
  y: number
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export interface HeadPose {
  pitch: number
  yaw: number
  roll: number
}

export interface JawlineData {
  angle: number
  width: number
  sharpness: number
}

export interface EyeData {
  leftOpenness: number
  rightOpenness: number
  interocularDistance: number
}

export type EmotionKey = keyof ExpressionScores

export interface OverlaySettings {
  showLandmarks: boolean
  showBox: boolean
  showSymmetryAxis: boolean
  showLabel: boolean
}

export interface TrackedFace extends FaceAnalysisResult {
  color: string
  index: number
}
