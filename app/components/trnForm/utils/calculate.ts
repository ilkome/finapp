import { formatByCurrency } from '~/components/amount/utils'

const config = {
  decimalPlaces: 2,
  maxIntegerLength: 999,
  separator: ' ',
} as const

type CalculatorOperator = '+' | '-' | '*' | '/'
type CalculatorAction = '=' | 'c' | '.' | CalculatorOperator
type CalculatorInput = string | number

export type CalculatorKey =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | '+' | '-' | '*' | '/'
  | '.' | 'c'

function splitExpression(value: string): string[] {
  return value.split(/([/*\-+])/).filter(Boolean)
}

function sanitizeInput(value: string): string {
  return String(value).replace(/[ ,]/g, '')
}

function isOperator(value: string): boolean {
  return /[/*\-+]/.test(value)
}

function isValidAction(value: string): value is CalculatorAction {
  return ['*', '+', '-', '.', '/', '=', 'c'].includes(value)
}

function getLastNumber(expression: string): string {
  return expression.split(/[/*\-+]/).at(-1) || ''
}

export function evaluateExpression(value: string): number {
  try {
    const sanitized = sanitizeInput(value)
    const lastChar = sanitized.at(-1) || ''
    const expression = isOperator(lastChar)
      ? sanitized.slice(0, -1)
      : sanitized || '0'

    // Using Function constructor is necessary for dynamic evaluation
    // but we ensure input is sanitized
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict";return (${expression})`)()

    return result <= Number.MAX_SAFE_INTEGER ? Math.abs(result) : 0
  }
  catch {
    return Number.isInteger(value) ? Number(value) : 0
  }
}

function handleDecimalPoint(expression: string, lastChar: string): string {
  const currentNumber = getLastNumber(expression)

  if (currentNumber.includes('.') || lastChar === '.')
    return expression

  if (isOperator(lastChar))
    return `${expression}0.`

  return `${expression}.`
}

export function createExpressionString(input: string, expression: string): string {
  const sanitizedExpression = sanitizeInput(expression)
  const lastChar = sanitizedExpression.at(-1) || ''
  const isActionInput = isValidAction(input)

  // Special actions handler
  if (input === 'c')
    return sanitizedExpression === '0' ? '0' : sanitizedExpression.slice(0, -1) || '0'
  if (input === '=')
    return formatInput(evaluateExpression(sanitizedExpression))
  if (input === '.')
    return handleDecimalPoint(sanitizedExpression, lastChar)

  // Zero handling
  if (sanitizedExpression === '0') {
    return input === '0' ? expression : (isActionInput ? `0${input}` : input)
  }

  // Operator replacement
  if (isActionInput && isOperator(lastChar)) {
    return sanitizedExpression.slice(0, -1) + input
  }

  // Number input validation
  if (!isActionInput) {
    const currentNumber = getLastNumber(sanitizedExpression)
    const [integerPart, decimalPart] = currentNumber.split('.')

    const isExceedingLength = (!decimalPart && integerPart && integerPart?.length >= config.maxIntegerLength)
      || (decimalPart && decimalPart?.length >= config.decimalPlaces)

    if (isExceedingLength)
      return expression

    if (lastChar !== '.' && evaluateExpression(sanitizedExpression + input) === 0)
      return sanitizedExpression
  }

  return sanitizedExpression + input
}

export function formatInput(value: CalculatorInput): string {
  return splitExpression(String(value))
    .map((part) => {
      if (isOperator(part))
        return ` ${part} `

      const [integerPart, decimalPart] = sanitizeInput(part).split('.')
      const formattedInteger = formatByCurrency(integerPart || '', config.separator)

      return decimalPart
        ? `${formattedInteger}.${decimalPart}`
        : formattedInteger
    })
    .join('')
}
