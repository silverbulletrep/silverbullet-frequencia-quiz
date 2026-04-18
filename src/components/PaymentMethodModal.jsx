import React, { useState } from 'react'
import styles from './PaymentMethodModal.module.scss'
import mbwayImg from '../../img/bandeiras/Logo-MBway.webp'
import multibancoImg from '../../img/bandeiras/multo-banco-fundo trasparente.webp'
import cartaoImg from '../../img/bandeiras/cartões.webp'
import openBankImg from '../../img/bandeiras/open-bank.webp'

export default function PaymentMethodModal({ open, onClose, onSelect }) {
    const [selected, setSelected] = useState(null)

    if (!open) return null

    const methods = [
        { id: 'mbway', label: 'MB WAY', img: mbwayImg },
        { id: 'multibanco', label: 'MULTIBANCO', img: multibancoImg },
        { id: 'card', label: 'Cartões (Visa/MC)', img: cartaoImg },
    ]

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                <h2 className={styles.title}>Escolha o método de pagamento</h2>

                <div className={styles.methodsGrid}>
                    {methods.map((method) => (
                        <button
                            key={method.id}
                            className={`${styles.methodCard} ${selected === method.id ? styles.methodCardSelected : ''}`}
                            onClick={() => {
                                setSelected(method.id)
                                onSelect(method.id)
                            }}
                        >
                            <div className={styles.methodImgWrap}>
                                <img src={method.img} alt={method.label} className={styles.methodImg} />
                            </div>
                            <span className={styles.methodLabel}>{method.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
