import { test, expect } from 'vitest'
import { buildMorningFeelingPayload } from '../src/lib/morningFeelingPayload.js'

test('buildMorningFeelingPayload retorna question e response corretos', () => {
  const labelsByKey = {
    abundance: 'Desbloquear minha Riqueza',
    energy: 'Desbloquear minha Paz'
  }
  const { payload, invalidKeys, missingLabelKeys, validKeys } = buildMorningFeelingPayload({
    question: '  Qual é o seu objetivo?  ',
    selectedKeys: ['abundance', 'energy'],
    labelsByKey
  })

  expect(payload).toEqual({
    attributes: {
      question: 'Qual é o seu objetivo?',
      response: ['Desbloquear minha Riqueza', 'Desbloquear minha Paz']
    }
  })
  expect(invalidKeys).toEqual([])
  expect(missingLabelKeys).toEqual([])
  expect(validKeys).toEqual(['abundance', 'energy'])
})

test('buildMorningFeelingPayload filtra opções inválidas e labels ausentes', () => {
  const labelsByKey = {
    abundance: 'Desbloquear minha Riqueza'
  }
  const { payload, invalidKeys, missingLabelKeys, validKeys } = buildMorningFeelingPayload({
    question: 'Pergunta',
    selectedKeys: ['abundance', 'invalid', 'energy'],
    labelsByKey
  })

  expect(payload).toEqual({
    attributes: {
      question: 'Pergunta',
      response: ['Desbloquear minha Riqueza']
    }
  })
  expect(invalidKeys).toEqual(['invalid'])
  expect(missingLabelKeys).toEqual(['energy'])
  expect(validKeys).toEqual(['abundance', 'energy'])
})
