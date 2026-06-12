/**
 * Flips to `true` on the first idle frame after mount. Gating heavy below-the-fold
 * widgets (echarts) on it keeps their fetch + init off the boot-critical main thread.
 */
export function useIdleMount(): Readonly<Ref<boolean>> {
  const isIdleReady = ref(false)

  onMounted(() => {
    const schedule = window.requestIdleCallback?.bind(window)
      ?? ((cb: () => void) => window.setTimeout(cb, 200))
    schedule(() => {
      isIdleReady.value = true
    })
  })

  return readonly(isIdleReady)
}
