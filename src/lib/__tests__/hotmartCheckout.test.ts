import { describe, expect, it } from 'vitest'

import { buildCheckoutJourneyContext } from '../hotmartCheckout'

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
})
