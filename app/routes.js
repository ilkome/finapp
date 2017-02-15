import AccountList from './components/account/AccountList'
import TrnCreate from './components/trn/TrnCreate'
import TrnList from './components/trn/TrnList'
import TrnView from './components/trn/TrnView'
import TrnEdit from './components/trn/TrnEdit'

const routes = [
  { path: '/', component: AccountList },
  { path: '/accounts', component: AccountList },
  { path: '/create', component: TrnCreate },
  { path: '/trns', component: TrnList },
  { path: '/trn/:id', component: TrnView },
  { path: '/trn/:id/edit', component: TrnEdit }
]

export default routes
