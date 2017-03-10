import AccountVeiw from './components/accounts/AccountVeiw.vue'
import Dashboard from './components/dashboard/Dashboard.vue'
import TrnCreate from './components/trn/TrnCreate.vue'
import TrnList from './components/trn/TrnList.vue'
import TrnEdit from './components/trn/TrnEdit.vue'

const routes = [
  { path: '/', component: Dashboard },
  { path: '/account/:id', component: AccountVeiw },
  { path: '/create', component: TrnCreate },
  { path: '/trns', component: TrnList },
  { path: '/trn/:id/edit', component: TrnEdit }
]

export default routes
