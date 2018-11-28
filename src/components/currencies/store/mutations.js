import isEqual from 'lodash/isEqual'

export default {
  setCurrencies (state, { base, date, items }) {
    if (!isEqual(state.base, base)) {
      state.base = base
    }
    if (!isEqual(state.date, date)) {
      state.date = date
    }
    if (!isEqual(state.items, items)) {
      state.items = items
    }
  }
}
