import React from 'react'
import styles from './Componenetes.module.scss'
import AuthorityHeader from '@/components/AuthorityHeader'
import DiscountBottomSheet from '@/components/DiscountBottomSheet'
import StandardDiscountContent from '@/components/StandardDiscountContent'

import ComparisonCard from '@/components/ComparisonCard'
import DidYouKnow from '@/components/DidYouKnow'
import FaqAccordion from '@/components/FaqAccordion'
import PageIndicator from '@/components/PageIndicator'
import PageTransition from '@/components/PageTransition/PageTransition'

export default function Componenetes() {
  const [showSheet, setShowSheet] = React.useState(false)
  const [showCheckout, setShowCheckout] = React.useState(false)
  const items = [
    { name: 'AuthorityHeader', render: () => <AuthorityHeader /> },
    { name: 'DiscountBottomSheet', render: () => <DiscountBottomSheet open={showSheet} onClose={() => setShowSheet(false)} onContinue={() => { setShowSheet(false); setShowCheckout(true) }} /> },
    { name: 'StandardDiscountContent', render: () => <StandardDiscountContent onContinue={() => setShowSheet(true)} /> },

    { name: 'ComparisonCard', render: () => <ComparisonCard /> },
    { name: 'DidYouKnow', render: () => <DidYouKnow onContinue={() => void 0} /> },
    { name: 'FaqAccordion', render: () => <FaqAccordion /> },
    { name: 'PageIndicator', render: () => <PageIndicator current={1} total={5} /> },
    { name: 'PageTransition', render: () => <PageTransition><div style={{ padding: 16 }}>Conteúdo em transição</div></PageTransition> },
  ]
  return (
    <div className={styles.pageRoot}>
      <h1 className={styles.title}>Componentes</h1>
      <p className={styles.subtitle}>Listagem dos componentes usados no checkout e página FIM</p>
      <div className={styles.grid}>
        {items.map((it) => (
          <div key={it.name} className={styles.card}>
            <div className={styles.cardHeader}>{it.name}</div>
            <div className={styles.cardBody}>{it.render()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
