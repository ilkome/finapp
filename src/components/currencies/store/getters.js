export default {
  getAmountInBaseCurrency: (state, getters, rootState) => ({ amount, currency }) => {
    let fixed = rootState.currencies.base === 'RUB' ? 0 : 2
    const baseValue = (amount / rootState.currencies.items[currency]).toFixed(fixed)
    return Number(baseValue)
  }
}
