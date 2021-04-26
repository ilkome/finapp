import { ref, computed } from '@nuxtjs/composition-api'
import currency from 'currency.js'

const baseAmountFormat = (value: string, separator: string, symbol?: string) => currency(value, { symbol, precision: 0, pattern: '#', separator }).format()

// State
const fixed: number = 2
const expression = ref('0')
const separator = ref(' ')
const isKeysActive = ref(true)

export default function useCalculator () {
  /**
   * Set separator
   *
   * @param {string} sep
   */
  function setSeparator (sep: string): void {
    separator.value = sep
    expression.value = formatInput(expression.value)
  }

  /**
   * Set formated expression
   *
   * @param {string} value
   */
  function setExpression (value: string): void {
    expression.value = formatInput(value)
  }

  /**
   * Set key listeners for keyboard
   *
   * @param {boolean} value
   */
  function setKeysActive (value: boolean): void {
    isKeysActive.value = value
  }

  /**
   * Create array from expression
   *
   * @param {string} value
   * @return {string[]}
   */
  function separateExpression (value: string): string[] {
    return value
      .split(/(\/|\*|-|\+)/)
      .filter(i => i)
  }

  /**
   * Remove space in string
   *
   * @param {string} value
   * @return {string}
   */
  function removeSpaces (value:string): string {
    return String(value).replace(/[ ,]/g, '')
  }

  function checkIsLastSimbolAction (lastSimbol:string): boolean {
    return Number.isNaN(Number.parseInt(lastSimbol))
  }

  /**
   * Make calculation
   *
   * @param {string} value
   * @return {(string | undefined)}
   */
  function makeCalculation (value: string) : string {
    try {
      const clearedExpression = removeSpaces(value)
      const lastSimbol = clearedExpression.slice(-1)
      const isLastSimbolAction = checkIsLastSimbolAction(lastSimbol)
      const prepeatedExpression = isLastSimbolAction ? clearedExpression.slice(0, -1) : clearedExpression

      const math = Function('"use strict";return (' + prepeatedExpression + ')')()

      if (math <= Number.MAX_SAFE_INTEGER) {
        return String(Math.abs(math))
      }
      return '0'
    }
    catch (error) {
      console.log(error)
      return value
    }
  }

  /**
   * Create expression string
   *
   * @param {string} expression
   * @param {string} value
   * @return {string} expression
   */
  function createExpressionString (expression: string, value: string): string {
    const inputIsAction = Number.isNaN(Number.parseInt(value))

    // Last simbol of expression
    const clearedExpression = removeSpaces(expression)
    const lastSimbol = clearedExpression.slice(-1)
    const isLastSimbolAction = checkIsLastSimbolAction(lastSimbol)
    const isSumAction = value === '='
    const isDeleteAction = value === 'delete'
    const isDotAction = value === '.'

    // Delete
    if (clearedExpression !== '0' && isDeleteAction) {
      const deleteString = clearedExpression.slice(0, -1)
      if (deleteString) { return deleteString }
      return '0'
    }

    // Start from 0
    if (clearedExpression === '0') {
      if (value === '0') { return expression }
      if (!inputIsAction) { return value }
    }

    // Change math simbol
    if (inputIsAction && isLastSimbolAction && !isDotAction && !isSumAction && !isDeleteAction) {
      return clearedExpression.slice(0, -1) + value
    }

    // Calculate
    if (inputIsAction && isSumAction) {
      const result = makeCalculation(clearedExpression)
      return formatInput(result, true)
    }

    // Handle dot value
    if (inputIsAction && isDotAction) {
      if (Array.isArray(clearedExpression.split(/[/*\-+]/)) && (clearedExpression.split(/[/*\-+]/).slice(-1)[0].includes('.') || isLastSimbolAction)) {
        if (isLastSimbolAction && lastSimbol !== '.') {
          return clearedExpression + '0.'
        }
        return expression
      }
      else {
        return clearedExpression + value
      }
    }

    // Add math simbol
    if (inputIsAction) {
      return clearedExpression + value
    }

    // Handle number
    const maxIntegerLengthAllowed = 12
    const separatedExpression = separateExpression(clearedExpression)

    if (separatedExpression) {
      const lastNumber = separatedExpression.slice(-1)[0]
      const lastNumberSplit = lastNumber.split(/[.]/)
      const isInteger = lastNumberSplit.length === 1

      // Check if math will success
      if (lastSimbol !== '.') {
        const result = makeCalculation(clearedExpression + value)
        if (result === '0') { return clearedExpression }
      }

      // Limit integer
      if (isInteger && lastNumber.length < maxIntegerLengthAllowed) {
        return clearedExpression + value
      }

      // Limit float
      if (!isInteger && lastNumberSplit[1].length < fixed) {
        return clearedExpression + value
      }
    }

    return expression
  }

  /**
   * Format input
   *
   * @param {(string | number)} value
   * @param {boolean} [isTrimFloatSpaces]
   * @return {string} expression string
   */
  function formatInput (value: string, isTrimFloatSpaces?: boolean): string {
    const formatedArray = separateExpression(String(value))
      .map((item) => {
        let formatedItem = ''
        const isAction = item.match(/[/*\-+]/g)

        if (isAction) {
          formatedItem = ` ${item} `
        }
        else {
          let clearedValue = removeSpaces(String(item))

          // Remove ended zero after dot
          if (isTrimFloatSpaces) {
            clearedValue = String(parseFloat(Number(clearedValue).toFixed(fixed)))
          }

          const splitFloatValue = String(clearedValue).split(/[.]/)
          const isInteger = splitFloatValue.length === 1

          if (isInteger) {
            formatedItem = baseAmountFormat(item, separator.value)
          }
          else {
            formatedItem = baseAmountFormat(splitFloatValue[0], separator.value) + '.' + splitFloatValue[1]
          }
        }
        return formatedItem
      })

    return formatedArray.join('')
  }

  function clearExpression (): void {
    expression.value = '0'
  }

  function handleTouch (input: string): void {
    const expressionValue = createExpressionString(expression.value, input)
    expression.value = formatInput(expressionValue)
  }

  function keyboardHandler (event: KeyboardEvent): void {
    if (!isKeysActive.value) { return }

    const allowValue = (event.key).match(/[0-9%/*\-+=.,]|Backspace|Enter/)
    let input = allowValue ? allowValue.input : false

    if (input) {
      if (input === ',') { input = '.' }
      if (input === 'Enter') { input = '=' }
      if (input === 'Backspace') { input = 'delete' }

      handleTouch(input)
    }
  }

  const getExpression = computed(() => expression.value)
  const getResult = computed(() => {
    const result = makeCalculation(getExpression.value)
    return Number(result)
  })
  const getFormatedResult = computed(() => { return formatInput(expression.value) })
  const isSum = computed(() => String(getResult.value) === removeSpaces(expression.value))

  return {
    expression,
    formatInput,
    isSum,
    getExpression,
    getFormatedResult,
    setExpression,
    getResult,
    isKeysActive,
    setKeysActive,
    makeCalculation,
    separateExpression,
    clearExpression,
    keyboardHandler,
    createExpressionString,
    setSeparator,
    handleTouch,
    removeSpaces
  }
}
