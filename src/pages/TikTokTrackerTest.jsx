import React, { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { asset } from '@/lib/asset'

export default function TikTokTrackerTest() {
  const { search } = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const ttclid = params.get('ttclid') || ''
  const utm_source = params.get('utm_source') || ''
  const utm_campaign = params.get('utm_campaign') || ''

  return (
    <div style={{ maxWidth: 680, margin: '32px auto', padding: '16px' }}>
      <h1 style={{ fontFamily: 'Poppins, Arial, sans-serif' }}>Teste Traker TikTok Build</h1>
      <p>Esta página valida build estático, assets e persistência de parâmetros.</p>

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Parâmetros detectados</h2>
        <ul>
          <li>ttclid: <strong>{ttclid || 'n/a'}</strong></li>
          <li>utm_source: <strong>{utm_source || 'n/a'}</strong></li>
          <li>utm_campaign: <strong>{utm_campaign || 'n/a'}</strong></li>
        </ul>
      </section>

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Validação de Imagem</h2>
        <p>Imagem servida de <code>/main/img</code> com asset helper.</p>
        <img
          src={asset('/img/homem.webp')}
          alt="homem"
          width="320"
          height="180"
          loading="eager"
          fetchpriority="high"
          decoding="async"
          style={{ borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
        />
      </section>

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2 style={{ marginTop: 0 }}>Navegação</h2>
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          style={{ padding: '10px 14px', borderRadius: 8, background: '#3CC7C2', color: '#0A1A4F', border: 'none', fontWeight: 600 }}
        >
          Ir para /quiz
        </button>
      </section>
    </div>
  )
}
