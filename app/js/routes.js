import AccountList from '../vue/AccountList'
import TrnCreate from '../vue/TrnCreate'
import TrnList from '../vue/TrnList'
import TrnView from '../vue/TrnView'

const About = { template: '<div>Обо мне</div>' }

const routes = [
  { path: '/', component: TrnList },
  { path: '/about', component: About },
  { path: '/accounts', component: AccountList },
  { path: '/create', component: TrnCreate },
  { path: '/trns', component: TrnList },
  { path: '/trn/:id', component: TrnView }
]

export default routes
