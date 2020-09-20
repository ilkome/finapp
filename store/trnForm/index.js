import dayjs from 'dayjs'
import actions from './actions'
import mutations from './mutations'

export const baseModalState = {
  calendar: false,
  categories: false,
  categoriesChild: false,
  description: false,
  transferFrom: false,
  transferTo: false,
  wallets: false,
  trn: false
}

const state = () => ({
  action: 'create',

  height: 0,
  modal: baseModalState,

  transfer: {
    from: null,
    to: null
  },

  show: false,
  showModalCategoryId: null,
  showModalTrnId: null,

  values: {
    amount: '0',
    amountEvaluation: null,
    amountType: 0,
    categoryId: null,
    date: dayjs().valueOf(),
    description: null,
    trnId: null,
    walletId: null
  }
})

export default {
  state,
  actions,
  mutations
}
