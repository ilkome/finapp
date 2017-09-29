import AccountPage from './components/AccountPage.vue'
import AccountsListPage from './components/AccountsListPage.vue'
import DashboardPage from './components/DashboardPage.vue'
import CategoriesListPage from './components/CategoriesListPage.vue'
import CategoryItemPage from './components/CategoryItemPage.vue'
import IncomesPage from './components/IncomesPage.vue'

const routes = [
  { path: '/index.html', component: DashboardPage },
  { path: '/', component: DashboardPage },
  { path: '/accounts', component: AccountsListPage },
  { path: '/accounts/:id', component: AccountPage },
  { path: '/categories', component: CategoriesListPage },
  { path: '/categories/:id', component: CategoryItemPage },
  { path: '/incomes', component: IncomesPage }
]

export default routes
