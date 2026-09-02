import Swiper from 'swiper'
import 'swiper/css'

export function useSwiperTabs(sliderRef: Ref<HTMLElement | null>) {
  const activeTabIdx = ref(0)
  // shallowRef, not ref: a plain ref deep-reactive-proxies the Swiper instance,
  // which corrupts its internal DOM/state so slideTo() (tab clicks) stops working.
  const sliderObj = shallowRef<Swiper | null>(null)

  function goToTab(idx: number) {
    activeTabIdx.value = idx
    sliderObj.value?.slideTo(idx)
  }

  onMounted(async () => {
    await nextTick()
    sliderObj.value = new Swiper(sliderRef.value!, {
      initialSlide: 0,
      longSwipesMs: 60,
      longSwipesRatio: 0.1,
      noSwiping: true,
      on: {
        slideChange: sw => activeTabIdx.value = sw.activeIndex,
      },
      shortSwipes: false,
      slidesPerView: 1,
    })
    // No `observer`/`observeParents`: the bottom sheet mutates the `transform` of
    // an ancestor `.drag` on every open/drag frame, which a Swiper observer would
    // answer with an update() each frame - janky slide switches plus disrupted
    // in-sheet scrolling. Recalc once after the open animation settles instead.
    requestAnimationFrame(() => sliderObj.value?.update())
  })

  onBeforeUnmount(() => sliderObj.value?.destroy(true, true))

  return {
    activeTabIdx,
    goToTab,
  }
}
