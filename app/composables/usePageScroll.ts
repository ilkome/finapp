export function usePageScroll() {
  const scroll = ref(0)

  onActivated(() => {
    setTimeout(() => {
      document.getElementById('pageScroll')?.scrollTo(scroll.value, scroll.value)
    }, 5)
  })

  onBeforeRouteLeave(() => {
    scroll.value = document.getElementById('pageScroll')?.scrollTop ?? 0
  })
}
