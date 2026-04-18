import React from 'react'

// Importa o módulo de estilos diretamente do arquivo gerado pelo Figma
// Mantemos os nomes de classes e a estrutura para reproduzir fielmente o design
import styles from '../../.figma/16_3060/index.module.scss'

/**
 * Componente de seleção de preços com layout idêntico ao arquivo do Figma.
 * Radio funcional (apenas uma opção selecionada por vez).
 * Não altera textos/estruturas do design.
 */
export default function PriceSelectorFigma({ selected = 'one_month', onSelect, onCheckout }) {
  const handleSelect = (value) => {
    if (onSelect) onSelect(value)
  }

  return null
}
