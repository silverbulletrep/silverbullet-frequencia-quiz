import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Fim from '../Fim'

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}))

vi.mock('@/lib/api', () => ({
  API_BASE_URL: '',
  finalizeStripePurchase: vi.fn(),
  finalizePayPalEmail: vi.fn()
}))

vi.mock('@/lib/leadCache', () => ({
  leadCache: {
    getAll: vi.fn(() => ({}))
  }
}))

vi.mock('../CommentsSection', () => ({
  default: () => <div />
}))

vi.mock('../FimBelowFold', () => ({
  default: () => <div />
}))

vi.mock('../lib/funnelTracker', () => ({
  createFunnelTracker: () => ({
    stepView: vi.fn(),
    purchase: vi.fn()
  }),
  QUIZ_FUNNEL_ID: 'quiz',
  QUIZ_PROGRESS_STEPS: { fim: { id: 'fim' } },
  getDefaultBaseUrl: () => '',
  readStoredCountry: () => undefined,
  buildRouteStep: () => ({}),
  shouldSendEvent: () => false
}))

afterEach(() => {
  try { delete window.__fimVideoDebug } catch { }
})

describe('Fim video debug', () => {
  it('exposes debug state and updates from postMessage', async () => {
    render(<Fim />)
    await act(async () => {})

    expect(window.__fimVideoDebug).toBeDefined()
    const get = window.__fimVideoDebug.get
    const initial = get()
    expect(initial.gatingComplete).toBe(false)

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: JSON.stringify({
            type: 'smartplayer.timeupdate',
            currentTime: 123,
            duration: 900
          })
        })
      )
    })

    const updated = get()
    expect(updated.currentTime).toBe(123)
    expect(updated.duration).toBe(900)
    expect(updated.source).toBe('postMessage')
  })
})
