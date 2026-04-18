import React from 'react'
import styles from './SkeletonFallback.module.scss'

/**
 * Quiz step skeleton — simulates header with logos, progress bar,
 * question heading, and 4 option buttons.
 */
function QuizSkeleton() {
    return (
        <div className={styles.wrapper} aria-busy="true" aria-label="Carregando quiz…">
            {/* header logos */}
            <div className={styles.quizHeader}>
                <div className={`${styles.bone} ${styles.logoBlock}`} />
                <div className={styles.divider} />
                <div className={`${styles.bone} ${styles.quizLabel}`} />
            </div>

            {/* progress bar */}
            <div className={styles.progressArea}>
                <div className={`${styles.bone} ${styles.progressTrack}`} />
            </div>

            {/* question + options */}
            <div className={styles.questionArea}>
                <div className={`${styles.bone} ${styles.headingBone}`} />
                <div className={styles.optionsList}>
                    <div className={`${styles.bone} ${styles.optionBone}`} />
                    <div className={`${styles.bone} ${styles.optionBone}`} />
                    <div className={`${styles.bone} ${styles.optionBone}`} />
                    <div className={`${styles.bone} ${styles.optionBone}`} />
                </div>
            </div>
        </div>
    )
}

/**
 * Generic page skeleton — header + centered content blocks.
 */
function PageSkeleton() {
    return (
        <div className={styles.wrapper} aria-busy="true" aria-label="Carregando…">
            {/* header placeholder */}
            <div className={styles.quizHeader}>
                <div className={`${styles.bone} ${styles.logoBlock}`} />
            </div>

            {/* centered content */}
            <div className={styles.pageCenter}>
                <div className={`${styles.bone} ${styles.pageBlock}`} />
                <div className={`${styles.bone} ${styles.pageBlockSmall}`} />
            </div>
        </div>
    )
}

/**
 * Route-aware Suspense fallback.
 * Uses `window.location.pathname` because `useLocation` is not available
 * inside the Suspense boundary that wraps <Routes>.
 */
export default function SkeletonFallback() {
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    // Normalise — strip base path prefix if present
    const normalised = path.replace(/^\/main/, '')

    const isQuizStep = /\/quiz-step-\d+/.test(normalised)

    if (isQuizStep) return <QuizSkeleton />
    return <PageSkeleton />
}

export { QuizSkeleton, PageSkeleton }
