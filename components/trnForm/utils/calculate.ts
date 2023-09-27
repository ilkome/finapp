import { formatByCurrency } from '~/components/currencies/utils'

// TODO: params
const fixed = 2
const separator = ' '
const maxIntegerLengthAllowed = 999

/**
 * Create array from expression
 *
 * @param {string} value
 * @return {string[]}
 */
function _separateExpression(value: string): string[] {
  return value
    .split(/([\/*\-+])/)
    .filter(i => i)
}

/**
 * Remove spaces in string
 *
 * @param {string} value
 * @return {string}
 */
function _removeSpaces(value: string): string {
  return String(value).replace(/[ ,]/g, '')
}

function _checkIsLastSymbolAction(lastSymbol: string): boolean {
  return Number.isNaN(Number.parseInt(lastSymbol))
}

/**
 * Make calculation
 *
 * @param {string} value
 * @return {(string | undefined)}
 */
export function getSum(value: string): number {
  try {
    const clearedExpression = _removeSpaces(String(value || ''))
    const lastSymbol = clearedExpression.slice(-1)
    const isLastSymbolAction = _checkIsLastSymbolAction(lastSymbol)
    const formattedExpression = (
      isLastSymbolAction
        ? clearedExpression.slice(0, -1)
        : clearedExpression
    ) || '0'

    // eslint-disable-next-line no-new-func
    const math = Function(`"";return (${formattedExpression})`)()

    if (math <= Number.MAX_SAFE_INTEGER)
      return Math.abs(math)

    return 0
  }
  catch (error) {
    console.log(error)
    return Number(value)
  }
}

/**
 * Create expression string
 *
 * @param {string} expression
 * @param {string} value
 * @return {string} expression
 */
export function createExpressionString(value: string, expression: string): string {
  const inputIsAction = Number.isNaN(Number.parseInt(value))

  // Last symbol of expression
  const clearedExpression = _removeSpaces(expression)
  const lastSymbol = clearedExpression.slice(-1)
  const isLastSymbolAction = _checkIsLastSymbolAction(lastSymbol)
  const isSumAction = value === '='
  const isDeleteAction = value.toLocaleLowerCase() === 'c'
  const isDotAction = value === '.'

  // Delete
  if (clearedExpression !== '0' && isDeleteAction) {
    const deleteString = clearedExpression.slice(0, -1)
    if (deleteString)
      return deleteString
    return '0'
  }

  // Starts from 0
  if (clearedExpression === '0') {
    if (value === '0')
      return expression
    if (!inputIsAction)
      return value
  }

  // Change math symbol
  if (inputIsAction && isLastSymbolAction && !isDotAction && !isSumAction && !isDeleteAction)
    return clearedExpression.slice(0, -1) + value

  // Calculate
  if (inputIsAction && isSumAction) {
    const result = getSum(clearedExpression)
    return formatInput(result)
  }

  // Handle dot value
  if (inputIsAction && isDotAction) {
    if (Array.isArray(clearedExpression.split(/[/*\-+]/)) && (clearedExpression.split(/[/*\-+]/).slice(-1)[0].includes('.') || isLastSymbolAction)) {
      if (isLastSymbolAction && lastSymbol !== '.')
        return `${clearedExpression}0.`

      return expression
    }
    else {
      return clearedExpression + value
    }
  }

  // Add math symbol
  if (inputIsAction)
    return clearedExpression + value

  // Handle number
  const separatedExpression = _separateExpression(clearedExpression)

  if (separatedExpression) {
    const lastNumber = separatedExpression.slice(-1)[0] || '0'
    const lastNumberSplit = lastNumber.split(/[.]/)
    const isInteger = lastNumberSplit.length === 1

    // Check if math will success
    if (lastSymbol !== '.') {
      const result = getSum(clearedExpression + value)
      if (result === 0)
        return clearedExpression
    }

    // Limit integer
    if (isInteger && lastNumber.length < maxIntegerLengthAllowed)
      return clearedExpression + value

    // Limit float
    if (!isInteger && lastNumberSplit[1].length < fixed)
      return clearedExpression + value
  }

  return expression
}

/**
 * Format input
 *
 * @param {string} value
 * @return {string} expression string
 */
export function formatInput(value: string | number): string {
  return _separateExpression(String(value))
    .map((item) => {
      const isAction = item.match(/[/*\-+]/g)

      if (isAction)
        return ` ${item} `

      const clearedValue = _removeSpaces(String(item))
      const splitFloatValue = String(clearedValue).split(/[.]/)
      const isInteger = splitFloatValue.length === 1

      if (isInteger)
        return formatByCurrency(item, separator)
      else
        return `${formatByCurrency(splitFloatValue[0], separator)}.${splitFloatValue[1]}`
    })
    .join('')
}
