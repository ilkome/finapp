export const useAppNav = defineStore('appNav', () => {
  const modals = useModal<'menu' | 'walletsSort'>()

  return {
    ...modals,
  }
})

function useModal<T>() {
  const modals = ref<T[]>([])

  function openModal(name: T) {
    if (modals.value.includes(name))
      return
    modals.value.push(name)
  }

  function closeModal(name: T) {
    modals.value = modals.value.filter(modal => modal !== name)
  }

  function closeAllModals() {
    modals.value = []
  }

  function isModalOpen(name: T) {
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
