import type { TrnId, Trns } from '~/components/trns/types'
import type { TrnsState } from '~/store/trns/types'

export default {
  setTrns(state: TrnsState, items: Trns) {
    if (!items)
      return {}

    state.items = Object.keys(items).reduce((prev, itemId) => {
      prev[itemId] = Object.freeze(items[itemId])
      return prev
    }, {})
  },

  showTrnModal(state: TrnsState) {
    state.modal.show = true
  },

  hideTrnModal(state: TrnsState) {
    state.modal.show = false
  },

  setTrnModalId(state: TrnsState, id: TrnId) {
    state.modal.id === id
      ? state.modal.id = null
      : state.modal.id = id
  },
}
