import dayjs from 'dayjs'
import { baseModalState } from './'

export default {
  closeAndCleanTrnForm (state) {
    state.show = false
    state.values = {
      amount: 0,
      amountEvaluation: null,
      amountType: 0,
      date: dayjs().valueOf(),
      description: null
    }
  },

  setTrnFormValues (state, values) {
    state.values = {
      ...state.values,
      ...values
    }
  },

  setTrnFormTransfer (state, { tranferType, walletId }) {
    if (tranferType) {
      state.transfer[tranferType] = walletId
    }
  },

  setTrnFormHeight (state, height) {
    state.height = height
  },

  setTrnFormModalCategoryId (state, id) {
    if (state.showModalCategoryId === id) {
      state.showModalCategoryId = null
    }
    else {
      state.showModalCategoryId = id
    }
  },

  toogleTrnFormModal (state, modalName) {
    state.modal = {
      ...baseModalState,
      [modalName]: !state.modal[modalName]
    }
  },

  closeTrnFormModal (state, modalName) {
    state.modal[modalName] = false
  },

  showTrnFormModal (state, modalName) {
    state.modal[modalName] = true
  },

  closeTrnForm (state) {
    state.show = false
  },

  openTrnForm (state) {
    state.show = true
  },

  toogleTrnForm (state) {
    state.show = !state.show
  }
}
