import isEqual from 'lodash/isEqual'

export default {
  setWallets (state, items) {
    if (!isEqual(state.items, items)) {
      state.items = items
    }
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
    } else {
      state.modal.id = id
    }
  },

  setWalletEditId (state, id) {
    if (state.editId === id) {
      state.editId = null
    } else {
      state.editId = id
    }
  }
}
