import currency from 'currency.js'

// TODO: refactor to Object Params
// TODO: is same like in Stat component?
export function formatByCurrency(value: string, separator: string, symbol?: string) {
  return currency(value, {
    pattern: '#',
    precision: 0,
    separator,
    symbol,
  })
    .format()
}
