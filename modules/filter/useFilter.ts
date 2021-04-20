import { useContext } from '@nuxtjs/composition-api'

export default function useFilter () {
  const { store } = useContext()

  function scrollTop () {
    const page = document.querySelector('.pageWrapScroll')
    page.scrollTop = 0
  }

  function setCategoryFilter (id) {
    store.dispatch('filter/handleSetFilterCategory', id)
    scrollTop()
  }

  function setWalletFilter (id) {
    store.dispatch('filter/handleSetFilterWallet', id)
    scrollTop()
  }

  return {
    setCategoryFilter,
    setWalletFilter
  }
}
