export const useAppUi = defineStore('appUi', () => {
  const menu = ref({
    position: 'bottom',
    status: '',
  })

  return {
    menu,
  }
})
