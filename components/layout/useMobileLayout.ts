import { ref } from '@nuxtjs/composition-api'

const isShowPeriodsNamesModal = ref(false)

export default function useMobileLayout () {
  function showPeriodsNamesModal () {
    isShowPeriodsNamesModal.value = true
  }
  function hidePeriodsNamesModal () {
    isShowPeriodsNamesModal.value = false
  }

  return {
    isShowPeriodsNamesModal,
    showPeriodsNamesModal,
    hidePeriodsNamesModal
  }
}
