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
const maxHeight = ref('100vh')

function init() {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef.value, {
      modules: [Pagination],
      init: false,
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      centeredSlides: true,
      initialSlide: 1,
      shortSwipes: false,
      longSwipesRatio: 0.1,
      longSwipesMs: 60,
      touchStartPreventDefault: false,

      pagination: {
        el: '.trnForm__pagination',
        clickable: true,
      },
    })
    sliderObj.value.init()
  }
}

onMounted(() => {
  setTimeout(() => {
    init()
  }, 300)
})
</script>

<template lang="pug">
.trnForm.h-full
  .swiper-container.h-full.overflow-hidden(ref="sliderRef")
    .swiper-wrapper.h-full
      //- History
      .h-full.swiper-slide.sm_max-w-sm(:style="{ height: maxHeight }")
        TrnFormTrnsSlide(
          v-if="sliderObj"
          :slider="sliderObj"
        )

      //- Main
      .swiper-slide.max-w-sm.sm_max-w-sm
        .scroll.scrollerBlock(:style="{ maxHeight: `${height}px` }")
          .py-4
            UiTitle.pb-2.px-3(@click="$trnForm.values.trnId = null")
              template(v-if="$trnForm.values.trnId") {{ $t('trnForm.titleEditTrn') }}
              template(v-if="!$trnForm.values.trnId") {{ $t('trnForm.createTrn') }}

            TrnFormMainTypes.px-3
            TrnFormMainDate
            TrnFormMainAmountTrn(v-if="$trnForm.values.trnType !== 2")
            TrnFormMainAmountTransfer(v-if="$trnForm.values.trnType === 2")

            TrnFormMainCalculator.pb-2(
              :amountRaw="$trnForm.values.amountRaw[$trnForm.activeAmountIdx]"
              @onChange="$trnForm.onChangeAmount"
            )

            //- Selected
            TrnFormMainSelectedTrn(v-if="$trnForm.values.trnType !== 2")

            .py-4
              //- Wallets
              .pb-6
                UiTitle2.pb-2.px-3(
                  @click="$trnForm.openTrnFormModal('wallets')"
                ) {{ $t('wallets.title') }}

                //- WalletsList(
                //-   :limit="6"
                //-   #default="{ walletsItemsLimited }"
                //- )
                //-   .px-3.grid.gap-y-1.gap-x-1.3sm_grid-cols-2
                //-     //- Wallet
                //-     TrnFormMainSelectedWallet(
                //-       v-for="(walletItem, walletId) in walletsItemsLimited"
                //-       :key="walletId"
                //-       :class="[{ 'cursor-default !bg-item-3': $trnForm.values.walletId === walletId }]"
                //-       :id="walletId"
                //-       isHideDots
                //-       @click="id => $trnForm.values.walletId = id"
                //-     )

                WalletsList(
                  :limit="6"
                  #default="{ walletsItemsLimited }"
                )
                  .px-3
                    WalletsItem2(
                      v-for="(wallet, walletId) in walletsItemsLimited"
                      :key="walletId"
                      :class="[{ 'cursor-default !bg-item-3': $trnForm.values.walletId === walletId }]"
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

      //- Quick selector
      .swiper-slide.sm_max-w-sm(:style="{ height: maxHeight }")
        .scroll.scrollerBlock
          .py-4
            //- Wallets
            .pb-6
              UiTitle.pb-2.px-3(
                @click="$trnForm.openTrnFormModal('wallets')"
              ) {{ $t('wallets.title') }}

              WalletsList(
                :limit="6"
                #default="{ walletsItemsLimited }"
              )
                .px-3.grid.gap-y-1.gap-x-1.3sm_grid-cols-2
                  //- Wallet
                  TrnFormMainSelectedWallet(
                    v-for="(walletItem, walletId) in walletsItemsLimited"
                    :key="walletId"
                    :class="[{ 'cursor-default !bg-item-3': $trnForm.values.walletId === walletId }]"
                    :id="walletId"
                    isHideDots
                    @click="id => $trnForm.values.walletId = id"
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
