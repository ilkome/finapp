import AccountsListPage from './components/AccountsListPage.vue'
import DashboardPage from './components/DashboardPage.vue'
import CategoriesListPage from './components/CategoriesListPage.vue'
import CategoryItemPage from './components/CategoryItemPage.vue'
import IncomesPage from './components/IncomesPage.vue'

const routes = [
  { path: '/index.html', component: DashboardPage, name: 'dashboard' },
  { path: '/', component: DashboardPage, name: 'dashboard' },
  { path: '/accounts', component: AccountsListPage },
  { path: '/categories', component: CategoriesListPage, name: 'categories' },
  { path: '/categories/:id', component: CategoryItemPage },
  { path: '/incomes', component: IncomesPage }
]

export default routes
