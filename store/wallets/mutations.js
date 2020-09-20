export default {
  setWallets (state, items) {
    const freezedItems = {}
    for (const itemId of Object.keys(items)) {
      freezedItems[itemId] = Object.freeze(items[itemId])
    }
    state.items = freezedItems
  },

  showWalletModal (state) {
    state.modal.show = true
  },

  hideWalletModal (state) {
    state.modal.show = false
  },

  setWalletModalId (state, id) {
    if (state.modal.id === id) {
      state.modal.id = null
    }
    else {
      state.modal.id = id
    }
  },

  setWalletEditId (state, id) {
    if (state.editId === id) {
      state.editId = null
    }
    else {
      state.editId = id
    }
  }
}
