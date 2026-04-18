import { create } from 'zustand'

type ProgressState = {
  stageProgress: number
  remainingSeconds: number
  setStageProgress: (value: number) => void
  setRemainingSeconds: (value: number) => void
  resetProgress: () => void
}

export const useProgressStore = create<ProgressState>((set) => ({
  stageProgress: 0,
  remainingSeconds: 0,
  setStageProgress: (value: number) => set(() => ({ stageProgress: Math.max(0, Math.min(100, Math.round(value))) })),
  setRemainingSeconds: (value: number) => set(() => ({ remainingSeconds: Math.max(0, Math.round(value)) })),
  resetProgress: () => set(() => ({ stageProgress: 0, remainingSeconds: 0 })),
}))
