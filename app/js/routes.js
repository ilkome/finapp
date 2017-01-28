import CreateTransaction from '../vue/CreateTransaction'
import AccountList from '../vue/AccountList'
import TrnView from '../vue/TrnView'
import TrnList from '../vue/TrnList'

const About = { template: '<div>Обо мне</div>' }

const routes = [
  { path: '/about', component: About },
  { path: '/accounts', component: AccountList },
  { path: '/create', component: CreateTransaction },
  { path: '/trns', component: TrnList },
  { path: '/trn/:id', component: TrnView }
]

export default routes
