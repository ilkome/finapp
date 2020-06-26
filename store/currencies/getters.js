export default {
  getAmountInBaseCurrency: (state, getters, rootState) => ({ amount, currency }) => {
    const fixed = rootState.currencies.base === 'RUB' ? 0 : 2
    const baseValue = (amount / rootState.currencies.rates[currency]).toFixed(fixed)
    return Number(baseValue)
  }
}
