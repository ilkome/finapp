import AccountPage from './components/accounts/AccountPage.vue'
import AccountsListPage from './components/accounts/AccountsListPage.vue'
import DashboardPage from './components/dashboard/DashboardPage.vue'
import TrnCreatePage from './components/trn/TrnCreatePage.vue'
import TrnsListPage from './components/trn/TrnsListPage.vue'
import TrnEdit from './components/trn/TrnEdit.vue'
import CategoriesList from './components/categories/CategoriesList.vue'
import CategoryItem from './components/categories/CategoryItem.vue'

const routes = [
  { path: '/', component: DashboardPage },
  { path: '/accounts', component: AccountsListPage },
  { path: '/accounts/:id', component: AccountPage },
  { path: '/create', component: TrnCreatePage },
  { path: '/trns', component: TrnsListPage },
  { path: '/trn/:id/edit', component: TrnEdit },
  { path: '/categories', component: CategoriesList },
  { path: '/categories/:id', component: CategoryItem }
]

export default routes
