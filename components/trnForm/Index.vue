<script setup lang="ts">
import Swiper, { Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'

import { useWindowSize } from '@vueuse/core'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useCategoriesStore } from '~/components/categories/useCategories'

const $trnForm = useTrnFormStore()
const categoriesStore = useCategoriesStore()
const { height } = useWindowSize()

/**
 * Slider
 */
const sliderRef = ref<any>(null)
const sliderObj = ref<any>(null)
const maxHeight = ref('550px')

function setTrnFormHeight() {
  const el = document.querySelector('.getHeight')
  const height = el?.clientHeight
  maxHeight.value = `${height}px`

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = entry.contentRect.height
      maxHeight.value = `${height}px`
    }
  })

  if (el)
    observer.observe(el)
}

function init() {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef.value, {
      modules: [Pagination],
      init: false,
      observer: true,
      observeParents: true,
      slidesPerView: 'auto',
      centeredSlides: true,
      initialSlide: 1,
      shortSwipes: false,
      longSwipesRatio: 0.1,
      longSwipesMs: 60,

      pagination: {
        el: '.trnForm__pagination',
        clickable: true,
      },
    })
    setTrnFormHeight()
    sliderObj.value.init()
  }
}

onMounted(init)
</script>

<template lang="pug">
.trnForm
  .swiper-container(ref="sliderRef")
    .swiper-wrapper.rounded-xl
      //- History
      .swiper-slide.sm_max-w-sm.sm_rounded-xl.bg-foreground-2(:style="{ height: maxHeight }")
        TrnFormTrnsSlide(
          v-if="sliderObj"
          :slider="sliderObj"
        )

      //- Main
      .swiper-slide.getHeight.max-w-sm.sm_rounded-xl.bg-foreground-2.sm_max-w-sm.sm_mx-6
        .scroll.scrollerBlock(:style="{ maxHeight: `${height}px` }")
          TrnFormMain

      //- Quick selector
      .swiper-slide.sm_rounded-xl.bg-foreground-2.sm_max-w-sm(:style="{ height: maxHeight }")
        .scroll.scrollerBlock
          .py-4
            //- Wallets
            .pb-6
              UiTitle.pb-2.px-3(
                @click="$trnForm.openTrnFormModal('wallets')"
              ) {{ $t('wallets.title') }}

              WalletsList(
                class="px-2"
                :limit="5"
                #default="{ walletsItemsLimited }"
              )
                //- Wallet
                WalletsItem(
                  v-for="(wallet, walletId) in walletsItemsLimited"
                  :key="walletId"
                  :activeItemId="$trnForm.values.walletId"
                  :walletId
                  :wallet
                  isHideDots
                  @click="$trnForm.values.walletId = walletId"
                )

            //- Favorite categories
            .pb-6(v-if="categoriesStore.favoriteCategoriesIds.length > 0")
              UiTitle.pb-2.px-3(
                @click="$trnForm.ui.catsRootModal = true"
              ) {{ $t('categories.favoriteTitle') }} {{ $t('categories.title') }}

              .px-3
                CategoriesList(
                  v-if="sliderObj"
                  :ids="categoriesStore.favoriteCategoriesIds"
                  :activeItemId="$trnForm.values.categoryId"
                  :slider="sliderObj"
                  class="!gap-x-1"
                  @click="id => $trnForm.values.categoryId = id"
                )

            //- Recent categories
            .pb-6(v-if="categoriesStore.recentCategoriesIds.length > 0")
              UiTitle.pb-2.px-3(
                @click="$trnForm.ui.catsRootModal = true"
              ) {{ $t('categories.lastUsedTitle') }} {{ $t('categories.title') }}

              .px-3
                CategoriesList(
                  v-if="sliderObj"
                  :ids="categoriesStore.recentCategoriesIds"
                  :activeItemId="$trnForm.values.categoryId"
                  :slider="sliderObj"
                  class="!gap-x-1"
                  @click="id => $trnForm.values.categoryId = id"
                )

  .trnForm__pagination

  //- Modals
  Teleport(to="body")
    TrnFormModals
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
