export function usePageScroll() {
  const route = useRoute()
  const scroll = ref<Record<string, number>>({})

  onUpdated(() => {
    setTimeout(() => {
      document.getElementById('pageScroll')?.scrollTo(0, scroll.value[route.path] ?? 0)
    }, 1)
  })

  onBeforeUpdate(() => {
    scroll.value[route.path] = document.getElementById('pageScroll')?.scrollTop ?? 0
  })
}
