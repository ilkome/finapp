import { formatByCurrency } from '~/components/amount/utils'

const config = {
  decimalPlaces: 8,
  maxIntegerLength: 999,
  separator: ' ',
} as const

type CalculatorOperator = '+' | '-' | '*' | '/'
type CalculatorAction = '=' | 'c' | '.' | CalculatorOperator
type CalculatorInput = string | number

export type CalculatorKey
  = | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
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

/**
 * Safe arithmetic expression evaluator (recursive descent parser).
 * Supports +, -, *, / with correct operator precedence. No eval/Function.
 */
export function evaluateExpression(value: string): number {
  try {
    const sanitized = sanitizeInput(value)
    const lastChar = sanitized.at(-1) || ''
    const expression = isOperator(lastChar)
      ? sanitized.slice(0, -1)
      : sanitized || '0'

    let pos = 0

    function parseExpr(): number {
      let left = parseTerm()
      while (pos < expression.length && (expression[pos] === '+' || expression[pos] === '-')) {
        const op = expression[pos++]
        const right = parseTerm()
        left = op === '+' ? left + right : left - right
      }
      return left
    }

    function parseTerm(): number {
      let left = parseNumber()
      while (pos < expression.length && (expression[pos] === '*' || expression[pos] === '/')) {
        const op = expression[pos++]
        const right = parseNumber()
        left = op === '*' ? left * right : left / right
      }
      return left
    }

    function parseNumber(): number {
      const start = pos
      while (pos < expression.length && ((expression[pos]! >= '0' && expression[pos]! <= '9') || expression[pos] === '.')) {
        pos++
      }
      return Number(expression.slice(start, pos)) || 0
    }

    const result = parseExpr()

    if (!Number.isFinite(result) || Math.abs(result) > Number.MAX_SAFE_INTEGER)
      return 0

    const abs = Math.abs(result)
    return Number.isInteger(abs) ? abs : +abs.toFixed(config.decimalPlaces)
  }
  catch {
    return 0
  }
}

function handleDecimalPoint(expression: string, lastChar: string): string {
  const currentNumber = getLastNumber(expression)

  if (currentNumber.includes('.') || lastChar === '.')
    return expression

  if (!expression || isOperator(lastChar))
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

      const isDecimal = part.at(-1) === '.'
      const [integerPart, decimalPart] = sanitizeInput(part).split('.')
      const formattedInteger = formatByCurrency(integerPart || '', config.separator)

      return decimalPart
        ? `${formattedInteger}.${decimalPart}`
        : `${formattedInteger}${isDecimal ? '.' : ''}`
    })
    .join('')
}
