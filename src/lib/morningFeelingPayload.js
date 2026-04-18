export const MORNING_FEELING_OPTION_KEYS = [
  'abundance',
  'attract',
  'healing',
  'energy',
  'other'
]

export const buildMorningFeelingPayload = ({ question, selectedKeys, labelsByKey }) => {
  const normalizedQuestion = typeof question === 'string' ? question.trim() : ''
  const keys = Array.isArray(selectedKeys) ? selectedKeys : []
  const validKeys = keys.filter((key) => MORNING_FEELING_OPTION_KEYS.includes(key))
  const invalidKeys = keys.filter((key) => !MORNING_FEELING_OPTION_KEYS.includes(key))
  const missingLabelKeys = validKeys.filter((key) => !labelsByKey?.[key])
  const response = validKeys
    .map((key) => labelsByKey?.[key])
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .map((value) => value.trim())

  return {
    payload: { attributes: { question: normalizedQuestion, response } },
    invalidKeys,
    missingLabelKeys,
    validKeys
  }
}
