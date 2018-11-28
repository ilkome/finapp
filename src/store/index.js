import Vue from 'vue'
import Vuex from 'vuex'

import app from '@/components/app/store'
import categories from '@/components/categories/store'
import chart from '@/components/chart/store'
import currencies from '@/components/currencies/store'
import dashboard from '@/components/dashboard/store'
import filter from '@/components/filter/store'
import stat from '@/components/stat/store'
import trnForm from '@/components/trnForm/store'
import trns from '@/components/trns/store'
import ui from '@/components/ui/store'
import user from '@/components/user/store'
import wallets from '@/components/wallets/store'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    categories,
    chart,
    currencies,
    dashboard,
    filter,
    stat,
    trnForm,
    trns,
    ui,
    user,
    wallets
  }
})
