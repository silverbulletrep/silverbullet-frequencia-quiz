import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PageTransition from '../../components/PageTransition';
import styles from '../../components/PageTransition/PageTransition.module.scss';
import { describe, it, expect, vi } from 'vitest';

describe('PageTransition', () => {
    it('renders children correctly', () => {
        const { getByText } = render(
            <MemoryRouter>
                <PageTransition>
                    <div>Tricky Test Child</div>
                </PageTransition>
            </MemoryRouter>
        );
        expect(getByText('Tricky Test Child')).toBeInTheDocument();
    });

    it('applies the appropriate CSS animation wrapper classes', () => {
        const { container } = render(
            <MemoryRouter>
                <PageTransition>
                    <div data-testid="child" />
                </PageTransition>
            </MemoryRouter>
        );
        const wrapper = container.firstChild;

        // Test base wrapper class
        expect(wrapper).toHaveClass(styles.transitionWrapper);

        // We expect natively supported view transitions or fallback class depending on environment 
        // Since document.startViewTransition is undefined in jsdom by default, fallback CSS should be applied.
        expect(wrapper.className).toContain(styles.fadeIn);
    });
});
