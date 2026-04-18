import React from 'react'
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import SkeletonFallback, { QuizSkeleton, PageSkeleton } from '../SkeletonFallback'

describe('SkeletonFallback', () => {
    it('renders QuizSkeleton for quiz step paths', () => {
        // Mock window.location.pathname
        const original = window.location.pathname
        Object.defineProperty(window, 'location', {
            value: { ...window.location, pathname: '/main/quiz-step-3' },
            writable: true,
        })

        const { container } = render(<SkeletonFallback />)
        // QuizSkeleton has 4 option bones
        const optionBones = container.querySelectorAll('[class*="optionBone"]')
        expect(optionBones.length).toBe(4)
        expect(container.querySelector('[aria-label]')).toHaveAttribute('aria-busy', 'true')

        Object.defineProperty(window, 'location', {
            value: { ...window.location, pathname: original },
            writable: true,
        })
    })

    it('renders PageSkeleton for non-quiz paths', () => {
        Object.defineProperty(window, 'location', {
            value: { ...window.location, pathname: '/main/resultado' },
            writable: true,
        })

        const { container } = render(<SkeletonFallback />)
        // PageSkeleton does NOT have optionBone elements
        const optionBones = container.querySelectorAll('[class*="optionBone"]')
        expect(optionBones.length).toBe(0)
        // But does have pageBlock
        const pageBlocks = container.querySelectorAll('[class*="pageBlock"]')
        expect(pageBlocks.length).toBeGreaterThan(0)

        Object.defineProperty(window, 'location', {
            value: { ...window.location, pathname: '/' },
            writable: true,
        })
    })

    it('QuizSkeleton has correct background and aria attributes', () => {
        const { container } = render(<QuizSkeleton />)
        const wrapper = container.firstChild
        expect(wrapper).toHaveAttribute('aria-busy', 'true')
        expect(wrapper).toHaveAttribute('aria-label', 'Carregando quiz…')
    })

    it('PageSkeleton has correct aria attributes', () => {
        const { container } = render(<PageSkeleton />)
        const wrapper = container.firstChild
        expect(wrapper).toHaveAttribute('aria-busy', 'true')
        expect(wrapper).toHaveAttribute('aria-label', 'Carregando…')
    })

    it('bones have shimmer animation class', () => {
        const { container } = render(<QuizSkeleton />)
        const bones = container.querySelectorAll('[class*="bone"]')
        expect(bones.length).toBeGreaterThan(0)
    })
})
