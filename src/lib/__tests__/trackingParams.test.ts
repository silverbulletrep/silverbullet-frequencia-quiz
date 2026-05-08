/**
 * Tests paid-traffic tracking parameter persistence and checkout URL merging.
 * Main coverage: captureTrackingParams, readStoredTrackingParams, appendTrackingParamsToUrl.
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  appendTrackingParamsToUrl,
  captureTrackingParams,
  readStoredTrackingParams,
} from '../trackingParams'

describe('trackingParams', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('captures xcod together with Meta UTM params', () => {
    captureTrackingParams('?utm_source=FB&utm_campaign=Campaign%7C123&xcod=FBhQwK21wXxRCampaign%7C123')

    expect(readStoredTrackingParams()).toMatchObject({
      utm_source: 'FB',
      utm_campaign: 'Campaign|123',
      xcod: 'FBhQwK21wXxRCampaign|123',
    })
  })

  it('appends xcod to checkout urls without replacing existing checkout params', () => {
    captureTrackingParams('?utm_source=FB&xcod=FBhQwK21wXxRAd%7C999')

    const result = appendTrackingParamsToUrl('https://pay.hotmart.com/N105101154W?checkoutMode=10&sck=abc123')
    const url = new URL(result)

    expect(url.searchParams.get('checkoutMode')).toBe('10')
    expect(url.searchParams.get('sck')).toBe('abc123')
    expect(url.searchParams.get('utm_source')).toBe('FB')
    expect(url.searchParams.get('xcod')).toBe('FBhQwK21wXxRAd|999')
  })
})
