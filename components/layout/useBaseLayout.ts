import { ref } from '#app'

const isShowPeriodsNamesModal = ref(false)

export default function useBaseLayout () {
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
