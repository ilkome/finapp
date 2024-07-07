<script setup lang="ts">
import Swiper, { Pagination } from 'swiper'
import type { CategoryId } from '../categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import 'swiper/css'
import 'swiper/css/pagination'

const trnFormStore = useTrnFormStore()
const categoriesStore = useCategoriesStore()
const walletsStore = useWalletsStore()
const isShow = computed(() =>
  walletsStore.hasItems
  && categoriesStore.hasCategories
  && trnFormStore.ui.isShow,
)
/**
 * Slider
 */
const sliderRef2 = ref<any>(null)
const sliderObj = ref<any>(null)

function init() {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef2.value, {
      init: true,
      initialSlide: 0,
      longSwipesMs: 60,
      longSwipesRatio: 0.1,
      modules: [Pagination],
      pagination: {
        clickable: true,
        el: '.trnForm__pagination',
      },
      shortSwipes: false,
      slidesPerView: 'auto',
    })
  }
}

watch(isShow, (v) => {
  if (v) {
    setTimeout(() => init(), 10)
  }
  else {
    sliderObj.value?.destroy()
    sliderObj.value = null
  }
})

function onSelectCategory(id: CategoryId) {
  trnFormStore.values.categoryId = id
}
</script>

<template>
  <Transition name="fadeIn" appear>
    <div
      v-if="isShow"
      class="absolute left-0 top-0 h-full trnForm w-80 overflow-hidden bg-foreground-3 border-r-2 border-item-5"
    >
      <div class="absolute right-2 top-2">
        <BaseBottomSheetClose @onClick="trnFormStore.onClose()" />
      </div>

      <div ref="sliderRef2" class="swiper-container h-full">
        <div class="swiper-wrapper">
          <!-- Main -->
          <div class="swiper-slide getHeight bg-foreground-2">
            <div class="grid grid-rows-[auto,1fr] gap-4 scroll scrollerBlock">
              <TrnFormMain maxHeight="100vh" />

              <!-- History -->
              <TrnFormTrnsSlide
                :slider="sliderObj"
                class="px-2 pt-4 pb-6"
              />
            </div>
          </div>

          <!-- Quick selector -->
          <div
            class="swiper-slide bg-foreground-2"
            :style="{ height: '100%' }"
          >
            <div class="scroll scrollerBlock">
              <div class="pb-4 pt-4">
                <TrnFormSelectionWalletsFast
                  class="pb-6"
                />

                <TrnFormSelectionCategoriesFast
                  @onSelectCategory="id => onSelectCategory(id)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="trnForm__pagination" />
    </div>
  </Transition>

  <!-- Modals -->
  <LazyTrnFormModalDescription v-if="trnFormStore.modal.description" />
</template>

<style lang="stylus">
.trnForm
  .swiper-pagination-horizontal
    z-index 2
    position absolute
    left 50%
    bottom 1px
    display flex
    align-items center
    justify-content center
    width auto
    padding 6px
    background alpha(#171717, .9)
    border-radius 6px

    .swiper-pagination-bullet
      opacity 1
      width 6px
      height 6px
      margin 0 4px
      background var(--c-bg-9)
      border-radius 50%
      anim()

      &-active
        width 10px
        border-radius 4px
</style>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

.scroll
  overflow hidden
  overflow-y auto
  height 100%
  scrollbar()
</style>
