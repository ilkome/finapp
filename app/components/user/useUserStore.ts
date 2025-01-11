import { signOut as signOutFirebase } from 'firebase/auth'
import localforage from 'localforage'
import { deepUnref } from 'vue-deepunref'
import { saveData } from '~~/services/firebase/api'

import { useAppNav } from '~/components/app/useAppNav'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useDemo } from '~/components/demo/useDemo'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type User = {
  displayName?: string | null
  email?: string | null
  photoURL?: string | null
  uid: string
}

export const useUserStore = defineStore('user', () => {
  const auth = useFirebaseAuth()!
  const { $config } = useNuxtApp()
  const currentUser = useCurrentUser()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const { closeAllModals } = useAppNav()
  const { isDemo } = useDemo()

  const user = ref<User | null>(currentUser.value || null)
  const isDevUser = computed(() => !!$config.public.ratesApiKey.includes(user.value?.email ?? ''))
  const uid = computed<string | null>(() => currentUser.value?.uid || user.value?.uid || null)

  watch(() => currentUser.value, user => setUser(user))

  function setUser(values: User | null) {
    if (!values || values === null) {
      user.value = null
    }
    else {
      user.value = {
        displayName: values?.displayName,
        email: values?.email,
        photoURL: values?.photoURL,
        uid: values.uid,
      }
    }

    localforage.setItem('finapp.user', deepUnref(user.value))
  }

  async function signOut() {
    closeAllModals()

    if (isDemo.value) {
      await localforage.clear()
      isDemo.value = 'false'
      window.location.href = '/login'
      return
    }

    try {
      trnsStore.unsubscribeTrns()
      categoriesStore.unsubscribeCategories()
      walletsStore.unsubscribeWallets()
      setUser(null)

      await signOutFirebase(auth)
    }

    catch (error) {
      console.log(error)
    }
  }

  function removeUserData() {
    closeAllModals()

    if (isDemo.value) {
      trnsStore.setTrns(null)
      categoriesStore.setCategories(null)
      walletsStore.setWallets(null)
      return
    }

    if (!uid.value) {
      return
    }

    saveData(`users/${uid.value}/accounts/`, null)
    saveData(`users/${uid.value}/categories/`, null)
    saveData(`users/${uid.value}/trns/`, null)
  }

  return {
    currentUser,
    isDevUser,
    removeUserData,
    setUser,
    signOut,
    uid,
    user,
  }
})
