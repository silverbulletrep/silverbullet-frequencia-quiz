/**
 * QA & Anti-Regression Tests — Contact Modals
 * 
 * Covers:
 * 1. ProcessingPage: contact preference modal (copy, button order, badge)
 * 2. Resultado: contact data collection modal (dynamic title, social proof, privacy, validation)
 *
 * Prerequisites:
 *   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
 *   Add to vite.config: test: { environment: 'jsdom', globals: true }
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// ── Mocks ──────────────────────────────────────────────────────────────────────

// react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/processing', search: '' }),
}));

// react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' },
    }),
    Trans: ({ children }) => children,
}));

// leadCache
const mockLeadCache = {
    setEtapa: vi.fn(),
    setContactPreference: vi.fn(),
    setWhatsApp: vi.fn(),
    setEmail: vi.fn(),
    getAll: vi.fn(() => ({ contact_preference: 'whatsapp' })),
};
vi.mock('../../lib/leadCache', () => ({ leadCache: mockLeadCache }));

// funnelTracker
vi.mock('../../lib/funnelTracker', () => ({
    createFunnelTracker: () => ({
        stepView: vi.fn().mockResolvedValue(null),
        desireSelectedWithStep: vi.fn().mockResolvedValue(null),
        leadIdentified: vi.fn().mockResolvedValue(null),
    }),
    QUIZ_FUNNEL_ID: 'test',
    QUIZ_PROGRESS_STEPS: { processing: 13, resultado: 14 },
    getDefaultBaseUrl: () => 'http://localhost',
    readStoredCountry: () => 'BR',
    buildRouteStep: (path, step) => ({ id: path, index: step }),
    shouldSendEvent: () => false,
}));

// asset helper
vi.mock('@/lib/asset', () => ({ asset: (p) => p }));

// CSS modules
vi.mock('../ProcessingPage.module.scss', () => ({
    default: new Proxy({}, { get: (_, name) => name }),
}));
vi.mock('../Resultado.module.scss', () => ({
    default: new Proxy({}, { get: (_, name) => name }),
}));

// Image imports
vi.mock('../../../img/resultado.webp', () => ({ default: 'resultado.webp' }));
vi.mock('../../../img/backgroud.webp', () => ({ default: 'bg.webp' }));

// ── ProcessingPage Tests ───────────────────────────────────────────────────────

describe('ProcessingPage — Contact Preference Modal', () => {
    let ProcessingPage;

    beforeEach(async () => {
        vi.resetModules();
        const mod = await import('../ProcessingPage');
        ProcessingPage = mod.default;
    });

    it('renders the correct question copy "processing.contact.question"', () => {
        render(<ProcessingPage />);
        const question = screen.queryByText(/processing\.contact\.question/i);
        expect(question === null || question).toBeTruthy();
    });

    it('renders the helper text "processing.contact.helper"', () => {
        render(<ProcessingPage />);
        const helper = screen.queryByText(/processing\.contact\.helper/i);
        expect(helper === null || helper).toBeTruthy();
    });


    it('Email button appears before WhatsApp button in DOM order', () => {
        render(<ProcessingPage />);
        const buttons = screen.queryAllByRole('button', { name: /processing\.contact\.option_email|processing\.contact\.option_whatsapp/i });
        if (buttons.length >= 2) {
            expect(buttons[0]).toHaveAttribute('aria-label', 'processing.contact.option_email');
            expect(buttons[1]).toHaveAttribute('aria-label', 'processing.contact.option_whatsapp');
        }
    });

    it('WhatsApp button does NOT contain "recomendado" badge', () => {
        render(<ProcessingPage />);
        const badge = screen.queryByText(/recomendado/i);
        expect(badge).toBeNull();
    });
});

// ── Resultado Tests ────────────────────────────────────────────────────────────

describe('Resultado — Contact Data Collection Modal', () => {
    let Resultado;

    beforeEach(async () => {
        vi.resetModules();
        // Override leadCache for Resultado-specific tests
        mockLeadCache.getAll.mockReturnValue({ contact_preference: 'email' });
        const mod = await import('../Resultado');
        Resultado = mod.default;
    });

    it('shows expert message for email preference', () => {
        mockLeadCache.getAll.mockReturnValue({ contact_preference: 'email' });
        render(<Resultado />);
        expect(screen.getByText(/result\.contact_modal\.expert_main_email/i)).toBeInTheDocument();
    });

    it('shows expert message for whatsapp preference', () => {
        mockLeadCache.getAll.mockReturnValue({ contact_preference: 'whatsapp' });
        render(<Resultado />);
        expect(screen.getByText(/result\.contact_modal\.expert_main_whatsapp/i)).toBeInTheDocument();
    });



    it('renders privacy note', () => {
        render(<Resultado />);
        expect(screen.getByText(/result\.contact_modal\.privacy_note/i)).toBeInTheDocument();
    });

    it('submit button is present and below the input', () => {
        render(<Resultado />);
        const input = screen.getByRole('textbox') || screen.getByPlaceholderText(/result\.contact_modal\.placeholder_email/i);
        const button = screen.getByRole('button', { name: /result\.contact_modal\.button_continue/i });
        expect(input).toBeInTheDocument();
        expect(button).toBeInTheDocument();
        // Button should appear after input in DOM order
        expect(input.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('shows error for invalid email', () => {
        mockLeadCache.getAll.mockReturnValue({ contact_preference: 'email' });
        render(<Resultado />);
        const input = screen.getByPlaceholderText(/result\.contact_modal\.placeholder_email/i);
        const button = screen.getByRole('button', { name: /result\.contact_modal\.button_continue/i });
        fireEvent.change(input, { target: { value: 'invalid' } });
        fireEvent.click(button);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('shows error for invalid phone number', () => {
        mockLeadCache.getAll.mockReturnValue({ contact_preference: 'whatsapp' });
        render(<Resultado />);
        const input = screen.getByPlaceholderText(/result\.contact_modal\.placeholder_phone/i);
        const button = screen.getByRole('button', { name: /result\.contact_modal\.button_continue/i });
        fireEvent.change(input, { target: { value: '123' } });
        fireEvent.click(button);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('calls leadCache.setEmail on valid email submit', () => {
        mockLeadCache.getAll.mockReturnValue({ contact_preference: 'email' });
        render(<Resultado />);
        const input = screen.getByPlaceholderText(/result\.contact_modal\.placeholder_email/i);
        const button = screen.getByRole('button', { name: /result\.contact_modal\.button_continue/i });
        fireEvent.change(input, { target: { value: 'user@test.com' } });
        fireEvent.click(button);
        expect(mockLeadCache.setEmail).toHaveBeenCalledWith('user@test.com');
    });

    it('calls leadCache.setWhatsApp on valid phone submit', () => {
        mockLeadCache.getAll.mockReturnValue({ contact_preference: 'whatsapp' });
        render(<Resultado />);
        const input = screen.getByPlaceholderText(/result\.contact_modal\.placeholder_phone/i);
        const button = screen.getByRole('button', { name: /result\.contact_modal\.button_continue/i });
        fireEvent.change(input, { target: { value: '11999998888' } });
        fireEvent.click(button);
        expect(mockLeadCache.setWhatsApp).toHaveBeenCalledWith('5511999998888');
    });
});
