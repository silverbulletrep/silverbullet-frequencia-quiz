import React, { useEffect, useRef, useState } from 'react'
import styles from './DiscountBottomSheet.module.scss'
import DidYouKnow from './DidYouKnow'
import StandardDiscountContent from './StandardDiscountContent'

export default function DiscountBottomSheet({ open, onClose, onContinue, variant = 'standard', spotsLeft = 27 }) {
  const operacao = 'bottom_sheet.open'
  const dados_entrada = { open }
  const sheetRef = useRef(null)
  const [closing, setClosing] = useState(false)
  useEffect(() => {
    if (open) setClosing(false)
  }, [open])
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      try { console.log('[FIM] Bottom sheet backdrop click') } catch { }
      requestClose(false)
    }
  }
  const handleContinue = async () => {
    const op = 'bottom_sheet.continue_click'
    try {
      console.log(`[FIM] Iniciando operação: ${op}`)
      await onContinue?.()
      console.log('[FIM] Operação concluída com sucesso:', { id_resultado: 'continue' })
    } catch (error) {
      console.error(`[FIM] Erro na operação: ${op}: ${error?.message}`, { stack: error?.stack })
    }
  }
  const scrollAreaRef = useRef(null)
  useEffect(() => {
    if (!open) return
    const stateId = `sheet_${Date.now()}`
    try {
      window.history.pushState({ stateId }, '')
      const onPop = () => {
        try { console.log('[FIM] Bottom sheet popstate close') } catch { }
        requestClose(true)
      }
      window.addEventListener('popstate', onPop)
      const onKey = (e) => {
        if (e.key === 'Escape') {
          try { console.log('[FIM] Bottom sheet escape close') } catch { }
          requestClose(false)
        }
      }
      window.addEventListener('keydown', onKey)
      return () => {
        try { window.removeEventListener('popstate', onPop); window.removeEventListener('keydown', onKey) } catch { }
      }
    } catch { }
  }, [open])
  const draggingRef = useRef(false)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  const rafRef = useRef(0)
  const setTranslate = (y) => {
    try {
      const el = sheetRef.current
      if (!el) return
      el.style.transform = `translateY(${Math.max(0, y)}px)`
    } catch { }
  }
  const clearTranslate = () => {
    try {
      const el = sheetRef.current
      if (!el) return
      el.style.transform = ''
    } catch { }
  }
  const onPointerDown = (e) => {
    try {
      const target = e.target
      const rect = sheetRef.current?.getBoundingClientRect()
      const topRegion = rect ? e.clientY <= rect.top + 80 : true
      const allow = target && (target.className?.toString()?.includes('dragHandle') || topRegion)
      if (!allow) return
      draggingRef.current = true
      startYRef.current = e.clientY || (e.touches && e.touches[0]?.clientY) || 0
      currentYRef.current = 0
      try { sheetRef.current.style.willChange = 'transform' } catch { }
      try { console.log('[FIM] Bottom sheet drag_start', { y: startYRef.current }) } catch { }
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
      window.addEventListener('touchmove', onPointerMove, { passive: false })
      window.addEventListener('touchend', onPointerUp)
    } catch { }
  }
  const onPointerMove = (e) => {
    if (!draggingRef.current) return
    try {
      const y = (e.clientY || (e.touches && e.touches[0]?.clientY) || 0) - startYRef.current
      currentYRef.current = Math.max(0, y)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => setTranslate(currentYRef.current))
      if (e.cancelable) e.preventDefault()
      try { console.log('[FIM] Bottom sheet drag_move', { y: currentYRef.current }) } catch { }
    } catch { }
  }
  const onPointerUp = () => {
    try {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)
    } catch { }
    if (!draggingRef.current) return
    draggingRef.current = false
    const threshold = 96
    const y = currentYRef.current
    try { console.log('[FIM] Bottom sheet drag_end', { y }) } catch { }
    if (y >= threshold) {
      try { console.log('[FIM] Bottom sheet drag_close') } catch { }
      requestClose(false)
    } else {
      clearTranslate()
    }
  }
  const requestClose = (triggeredByPop = false) => {
    try { console.log('[FIM] Bottom sheet request_close', { triggeredByPop }) } catch { }
    setClosing(true)
    if (!triggeredByPop) {
      try { window.history.back() } catch { }
    }
    window.setTimeout(() => {
      try { onClose?.() } catch { }
    }, 240)
  }
  if (!open) return null
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div ref={sheetRef} className={`${styles.sheet} ${closing ? styles.sheetClosing : ''}`} onPointerDown={onPointerDown} onTouchStart={onPointerDown}>
        <button className={styles.closeButton} aria-label="Fechar" onClick={() => { try { console.log('[FIM] Bottom sheet close_click') } catch { }; requestClose(false) }}>×</button>
        <div className={styles.dragHandle} aria-hidden="true" />
        <div ref={scrollAreaRef} className={styles.scrollArea}>
          <div className={styles.contentRoot}>
            {variant === 'post-checkout' ? (
              <DidYouKnow onContinue={() => requestClose(false)} />
            ) : (
              <StandardDiscountContent onContinue={handleContinue} spotsLeft={spotsLeft} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
