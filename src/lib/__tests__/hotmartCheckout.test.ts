import { describe, expect, it } from 'vitest'

import { buildCheckoutJourneyContext, buildHotmartCheckoutUrl } from '../hotmartCheckout'
import { captureTrackingParams } from '../trackingParams'

describe('buildCheckoutJourneyContext', () => {
  it('builds the front checkout tracking context', () => {
    expect(
      buildCheckoutJourneyContext({
        flow: 'front',
        origin: 'fim',
        paymentMethod: 'credit_card',
        emailPresent: true,
        leadIdShort: 'abc123',
      }),
    ).toEqual({
      journey_type: 'front',
      purchase_kind: 'main',
      product_id: 'elevate_front',
      checkout_origin: 'fim',
      payment_method: 'credit_card',
      email_present: true,
      lead_id_short: 'abc123',
    })
  })

  it('builds the upsell checkout tracking context', () => {
    expect(
      buildCheckoutJourneyContext({
        flow: 'upsell',
        origin: 'audio_upsell',
        paymentMethod: '',
        emailPresent: false,
      }),
    ).toEqual({
      journey_type: 'upsell',
      purchase_kind: 'upsell',
      product_id: 'elevate_up01',
      checkout_origin: 'audio_upsell',
      payment_method: '',
      email_present: false,
    })
  })

  it('preserves xcod when building Hotmart checkout url', () => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    captureTrackingParams('?utm_source=FB&xcod=FBhQwK21wXxRAd%7C999')

    const result = buildHotmartCheckoutUrl({
      baseUrl: 'https://pay.hotmart.com/N105101154W?checkoutMode=10',
      leadIdShort: 'leadshort123',
      email: 'buyer@example.com',
    })
    const url = new URL(result)

    expect(url.searchParams.get('checkoutMode')).toBe('10')
    expect(url.searchParams.get('sck')).toBe('leadshort123')
    expect(url.searchParams.get('email')).toBe('buyer@example.com')
    expect(url.searchParams.get('utm_source')).toBe('FB')
    expect(url.searchParams.get('xcod')).toBe('FBhQwK21wXxRAd|999')
  })
})
