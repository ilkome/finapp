export default {
  setWallets(state, items) {
    if (!items) {
      state.items = {}
      return
    }

    state.items = Object.keys(items).reduce((acc, id) => {
      acc[id] = Object.freeze(items[id])
      return acc
    }, {})
  },
}
