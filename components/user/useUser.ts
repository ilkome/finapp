import { signOut as signOutFirebase } from 'firebase/auth'
import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { useAppNav } from '~/components/app/useAppNav'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { auth, saveData } from '~/services/firebase/api'

export type User = {
  displayName?: string | null
  email?: string | null
  uid: string
}

export const useUserStore = defineStore('user', () => {
  const { $config } = useNuxtApp()
  const router = useRouter()
  const userStore = useUserStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const { closeAllModals } = useAppNav()

  const user = ref<User | null>(null)
  const isDevUser = computed(() => !!$config.public.ratesApiKey.includes(user.value?.email ?? ''))
  const uid = computed<string | null>(() => user.value?.uid || null)

  function setUser(values: User | null) {
    if (!values || values === null) {
      user.value = null
    }
    else {
      user.value = {
        displayName: values?.displayName,
        email: values?.email,
        uid: values.uid,
      }
    }

    localforage.setItem('finapp.user', deepUnref(user.value))
  }

  async function signOut() {
    try {
      closeAllModals()
      trnsStore.unsubscribeTrns(null)
      categoriesStore.unsubscribeCategories(null)
      walletsStore.unsubscribeWallets()
      userStore.setUser(null)

      await signOutFirebase(auth)

      if (router.currentRoute.name !== 'login')
        router.replace('/login')
    }

    catch (error) {
      console.log(error)
    }
  }

  function removeUserData() {
    closeAllModals()

    const uid = user.value?.uid
    if (!uid)
      return

    saveData(`users/${uid}/accounts/`, null)
    saveData(`users/${uid}/categories/`, null)
    saveData(`users/${uid}/trns/`, null)
  }

  return {
    isDevUser,
    removeUserData,
    setUser,

    signOut,
    uid,
    user,
  }
})
