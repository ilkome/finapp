import AccountPage from './components/accounts/AccountPage.vue'
import DashboardPage from './components/dashboard/DashboardPage.vue'
import TrnCreate from './components/trn/TrnCreate.vue'
import TrnList from './components/trn/TrnList.vue'
import TrnEdit from './components/trn/TrnEdit.vue'
import CategoriesList from './components/categories/CategoriesList.vue'
import CategoryItem from './components/categories/CategoryItem.vue'

const routes = [
  { path: '/', component: DashboardPage },
  { path: '/account/:id', component: AccountPage },
  { path: '/create', component: TrnCreate },
  { path: '/trns', component: TrnList },
  { path: '/trn/:id/edit', component: TrnEdit },
  { path: '/categories', component: CategoriesList },
  { path: '/categories/:id', component: CategoryItem }
]

export default routes
