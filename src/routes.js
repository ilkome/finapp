import AccountPage from './components/AccountPage.vue'
import AccountsListPage from './components/AccountsListPage.vue'
import DashboardPage from './components/DashboardPage.vue'
import TrnsListPage from './components/TrnsListPage.vue'
import CategoriesList from './components/CategoriesList.vue'
import CategoryItemPage from './components/CategoryItemPage.vue'
import SummaryPage from './components/SummaryPage.vue'
import IncomesPage from './components/IncomesPage.vue'
import ExpensesPage from './components/ExpensesPage.vue'

const routes = [
  { path: '/index.html', component: DashboardPage },
  { path: '/', component: DashboardPage },
  { path: '/accounts', component: AccountsListPage },
  { path: '/accounts/:id', component: AccountPage },
  { path: '/categories', component: CategoriesList },
  { path: '/categories/:id', component: CategoryItemPage },
  { path: '/incomes', component: IncomesPage },
  { path: '/expenses', component: ExpensesPage },
  { path: '/summary', component: SummaryPage },
  { path: '/trns', component: TrnsListPage }
]

export default routes
