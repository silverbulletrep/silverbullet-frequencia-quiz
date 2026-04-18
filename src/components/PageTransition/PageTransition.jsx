import React, { useLayoutEffect, useState, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import styles from './PageTransition.module.scss';

// Identify quiz steps and age selection
const QUIZ_STEP_REGEX = /^\/quiz-step-(\d+)$/;
const AGE_SELECTION_REGEX = /^\/age-selection-.*$/;

const isQuizFlow = (pathname) => {
    return QUIZ_STEP_REGEX.test(pathname) ||
        AGE_SELECTION_REGEX.test(pathname) ||
        pathname === '/quiz';
};

const getQuizStepNumber = (pathname) => {
    if (pathname === '/quiz') return 0;
    if (AGE_SELECTION_REGEX.test(pathname)) return 1;
    const match = pathname.match(QUIZ_STEP_REGEX);
    if (match) return parseInt(match[1], 10) + 1;
    return -1;
};

export default function PageTransition({ children }) {
    const location = useLocation();
    const navType = useNavigationType();
    const [prevPath, setPrevPath] = useState(location.pathname);
    const [animationClass, setAnimationClass] = useState(styles.fadeIn);

    // Feature detection
    const supportsViewTransitions = typeof document !== 'undefined' && 'startViewTransition' in document;

    useEffect(() => {
        if (prevPath === location.pathname) return;

        let isForward = true;
        const currentIsQuiz = isQuizFlow(location.pathname);
        const prevIsQuiz = isQuizFlow(prevPath);

        if (currentIsQuiz && prevIsQuiz) {
            const currentStep = getQuizStepNumber(location.pathname);
            const prevStep = getQuizStepNumber(prevPath);
            if (navType === 'POP') {
                isForward = false;
            } else {
                isForward = currentStep > prevStep;
            }
        } else if (navType === 'POP') {
            isForward = false;
        }

        setPrevPath(location.pathname);

        // Apply animation class for CSS fallback
        if (currentIsQuiz && prevIsQuiz) {
            setAnimationClass(isForward ? styles.slideUpEnter : styles.slideDownEnter);
        } else {
            setAnimationClass(styles.fadeIn);
        }
    }, [location.pathname, prevPath, navType]);

    // Use view-transition-name to hook into native View Transitions
    // The CSS fallback animation is only active if the browser lacks support.
    return (
        <div
            key={location.pathname}
            className={`${styles.transitionWrapper} ${!supportsViewTransitions ? animationClass : ''}`}
            style={{
                viewTransitionName: 'page-content',
                width: '100%',
                minHeight: '100dvh', /* Permite crescer com o conteúdo, corrigindo scroll/fundos cortados */
                display: 'flex',
                flexDirection: 'column',
                flex: 1
            }}
        >
            {children}
        </div>
    );
}
