import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './FaqAccordion.module.scss'

/**
 * FAQ Accordion component
 * Pattern extracted from FimBelowFold.jsx (L340-366)
 * Props: items — Array<{question: string, answer: string}>
 *        title — optional section title
 */
export default function FaqAccordion({ items = [], title }) {
    const [expandedIndex, setExpandedIndex] = useState(null)

    return (
        <div className={styles.wrapper}>
            {title && <h2 className={styles.title}>{title}</h2>}
            <div className={styles.list}>
                {items.map((item, idx) => (
                    <div key={idx} className={styles.item}>
                        <button
                            type="button"
                            className={styles.header}
                            onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                            aria-expanded={expandedIndex === idx}
                        >
                            <span className={styles.question}>{item.question}</span>
                            <ChevronDown
                                className={`${styles.arrow} ${expandedIndex === idx ? styles.arrowRotated : ''}`}
                                size={20}
                            />
                        </button>
                        {expandedIndex === idx && (
                            <div className={styles.content}>
                                {item.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
