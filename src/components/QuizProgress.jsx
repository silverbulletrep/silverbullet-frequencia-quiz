import React, { useMemo, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import ui from '@/styles/QuizUI.module.scss'

export default function QuizProgress({ current = 0, total = 1 }) {
  const { t } = useTranslation()
  const percent = useMemo(() => {
    const p = Math.round((Number(current) / Math.max(1, Number(total))) * 100)
    return Math.max(0, Math.min(100, p))
  }, [current, total])
  const prevPercent = useMemo(() => {
    const prevIdx = Math.max(0, Number(current) - 1)
    const p = Math.round((prevIdx / Math.max(1, Number(total))) * 100)
    return Math.max(0, Math.min(100, p))
  }, [current, total])
  const [fill, setFill] = useState(prevPercent)

  useEffect(() => {
    console.log('[QUIZ_PROGRESS] Render', { current, total, percent, timestamp: new Date().toISOString() })
  }, [current, total, percent])
  useEffect(() => {
    setFill(prevPercent)
    const id = requestAnimationFrame(() => {
      setFill(percent)
    })
    return () => cancelAnimationFrame(id)
  }, [prevPercent, percent])
  const navigate = useNavigate()
  const onBack = () => navigate(-1)

  return (
    <div className={ui.progressContainer} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <button type="button" className={ui.progressBackBtn} onClick={onBack} aria-label={t('quiz_progress.back_aria')}>
        <ArrowLeft size={16} />
      </button>
      <div className={ui.progressHeader}>
        <span className={ui.progressLabel}>{current}/{total}</span>
        <span className={ui.progressPercent}>{percent}%</span>
      </div>
      <div className={ui.progressTrack}>
        <div className={ui.progressFill} style={{ width: `${fill}%` }} />
      </div>
    </div>
  )
}
