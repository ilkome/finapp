import AccountPage from './components/AccountPage.vue'
import AccountsListPage from './components/AccountsListPage.vue'
import DashboardPage from './components/DashboardPage.vue'
import TrnsListPage from './components/TrnsListPage.vue'
import TrnEditPage from './components/TrnEditPage.vue'
import CategoriesList from './components/CategoriesList.vue'
import CategoryItem from './components/CategoryItem.vue'

const routes = [
  { path: '/index.html', component: DashboardPage },
  { path: '/', component: DashboardPage },
  { path: '/accounts', component: AccountsListPage },
  { path: '/accounts/:id', component: AccountPage },
  { path: '/trns', component: TrnsListPage },
  { path: '/trn/:id/edit', component: TrnEditPage },
  { path: '/categories', component: CategoriesList },
  { path: '/categories/:id', component: CategoryItem }
]

export default routes
