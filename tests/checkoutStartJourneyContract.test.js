import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const readSource = (relativePath) =>
  fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')

describe('checkout_start journey contract', () => {
  test('main checkout emits front journey attributes before redirect/opening checkout', () => {
    const source = readSource('src/pages/FimBelowFold.jsx')

    expect(source).toContain('buildCheckoutJourneyContext')
    expect(source).toContain("flow: 'front'")
    expect(source).toContain("origin: origin || 'fim'")
    expect(source).toContain('paymentMethod: paymentMethod || undefined')
    expect(source).toContain('emailPresent: Boolean(email)')
    expect(source).toContain('leadIdShort: leadIdShort || undefined')
    expect(source).toContain('discount_active: discountThemeActive')
    expect(source).toContain('gift_active: giftThemeActive')

    expect(
      source.indexOf('const { leadIdShort, email, paymentMethod } = await handleCheckoutTracking(')
    ).toBeLessThan(source.indexOf('window.location.href = checkoutUrl'))

    expect(source).toMatch(
      /const origin = checkoutOriginRef\.current \|\| 'fim'[\s\S]*await handleCheckoutTracking\('', origin\)[\s\S]*setShowStripeCheckout\(true\)/
    )
  })

  test('upsell checkout emits upsell journey attributes before redirect/opening checkout', () => {
    const source = readSource('src/pages/AudioUpsell.jsx')

    expect(source).toContain('buildCheckoutJourneyContext')
    expect(source).toContain("flow: 'upsell'")
    expect(source).toContain("origin: origin || 'audio_upsell'")
    expect(source).toContain('paymentMethod: storedMethod || undefined')
    expect(source).toContain('emailPresent: Boolean(email)')
    expect(source).toContain('leadIdShort: leadIdShort || undefined')
    expect(source).toContain("{ value: 47, currency: 'EUR' }")
    expect(source).toContain('amount_cents={4700}')

    expect(source.indexOf('await tracker.checkoutStart(')).toBeLessThan(
      source.indexOf('setShowStripeCheckout(true)')
    )
    expect(source.indexOf('await tracker.checkoutStart(')).toBeLessThan(
      source.indexOf('window.location.href = checkoutUrl')
    )
  })

  test('checkout modal does not emit a duplicate checkout_start', () => {
    const source = readSource('src/components/CheckoutModal.jsx')

    expect(source).not.toContain('checkoutStart(')
    expect(source).not.toContain('checkout_start')
  })

  test('discount retention is triggered by checkout idle, not by closing checkout', () => {
    const source = readSource('src/pages/FimBelowFold.jsx')
    const closeStart = source.indexOf('const handleCheckoutClose = useCallback(() => {')
    const idleStart = source.indexOf('const handleCheckoutIdle = useCallback(() => {')
    const closeBlock = source.slice(closeStart, idleStart)

    expect(closeBlock).toContain('setShowStripeCheckout(false)')
    expect(closeBlock).not.toContain('onDiscountActivated')
    expect(source.slice(idleStart)).toContain('onDiscountActivated(targetTime)')
  })

  test('checkout idle tracks movement, scrolling, touch, wheel and Stripe field activity', () => {
    const source = readSource('src/components/CheckoutModal.jsx')

    expect(source).toContain("'pointermove'")
    expect(source).toContain("'touchmove'")
    expect(source).toContain("'wheel'")
    expect(source).toContain("'scroll'")
    expect(source).toContain('stripe_card_number_change')
    expect(source).toContain('stripe_card_expiry_change')
    expect(source).toContain('stripe_card_cvc_change')
    expect(source).toContain('[IDLE] Activity captured; timer reset')
  })
})
