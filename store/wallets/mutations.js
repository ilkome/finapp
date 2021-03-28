export default {
  setWallets (state, items) {
    const freezedItems = {}
    if (items) {
      for (const itemId of Object.keys(items)) {
        freezedItems[itemId] = Object.freeze(items[itemId])
      }
    }
    state.items = freezedItems
  },

  showWalletsModalWalletModal (state) {
    state.modal.show = true
  },

  hideWalletsModalWalletModal (state) {
    state.modal.show = false
  },

  setWalletsModalWalletModalId (state, id) {
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
