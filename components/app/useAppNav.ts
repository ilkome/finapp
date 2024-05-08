import { useStorage } from '@vueuse/core'
import type { AppNav } from '~/components/app/types'

export const useAppNav = defineStore('appNav', () => {
  const activeTabStat = useStorage<AppNav>('activeTabStat', 'summary')

  const modals = useModal<['menu', 'walletsSort']>()

  return {
    ...modals,
    activeTabStat,
  }
})

// TODO: Add types
function useModal<T>() {
  type ModalTypes = T
  type ModalItem = T[number]

  const modals = ref<Partial<ModalTypes>>([])

  function openModal(name: ModalItem) {
    if (modals.value.includes(name))
      return
    modals.value.push(name)
  }

  function closeModal(name: ModalItem) {
    modals.value = modals.value.filter(modal => modal !== name)
  }

  function closeAllModals() {
    modals.value = []
  }

  function isModalOpen(name) {
    return modals.value.includes(name)
  }

  return {
    closeAllModals,
    closeModal,
    isModalOpen,
    modals,
    openModal,
  }
}
