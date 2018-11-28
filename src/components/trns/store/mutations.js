import isEqual from 'lodash/isEqual'

export default {
  setTrns (state, items) {
    if (!isEqual(state.items, items)) {
      state.items = items
    }
  },

  showTrnModal (state) {
    state.modal.show = true
  },

  hideTrnModal (state) {
    state.modal.show = false
  },

  setTrnModalId (state, id) {
    if (state.modal.id === id) {
      state.modal.id = null
    } else {
      state.modal.id = id
    }
  }
}
