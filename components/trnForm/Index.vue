<script setup lang="ts">
import SwiperCore, { Pagination } from 'swiper'
import 'swiper/swiper-bundle.css'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const props = withDefaults(defineProps<{
  show: boolean
}>(), {
  show: true,
})

SwiperCore.use([Pagination])

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()

/**
 * Slider
 */
const slider = ref<any>(null)
const sliderObj = ref<any>(null)
const maxHeight = ref('550px')

function setTrnFormHeight() {
  const el = document.querySelector('.getHeight')
  const height = el?.clientHeight

  $store.commit('trnForm/setTrnFormHeight', height)
  maxHeight.value = `${height}px`

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const height = entry.contentRect.height
      $store.commit('trnForm/setTrnFormHeight', height)
      maxHeight.value = `${height}px`
    }
  })

  if (el)
    observer.observe(el)
}

function init() {
  if (!sliderObj.value) {
    sliderObj.value = new SwiperCore(slider.value, {
      init: false,
      observer: true,
      observeParents: true,
      slidesPerView: 1,
      touchStartPreventDefault: false,
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

/**
 * isShow
 */
onMounted(() => {
  init()
})

watch(() => props.show, (isShow) => {
  if (!isShow) {
    if (sliderObj.value)
      sliderObj.value.slideTo(1, 0)
  }
})
</script>

<template lang="pug">
.trnForm.max-w-md.mx-auto
  .swiper-container(ref="slider")
    .swiper-wrapper
      //- History
      .swiper-slide(:style="{ height: maxHeight }")
        TrnFormTrnsSlide(
          v-if="sliderObj"
          :slider="sliderObj"
        )

      //- Main
      .swiper-slide.getHeight
        .scroll.scrollerBlock(:style="{ maxHeight: `${$store.state.ui.height}px` }")
          TrnFormMain

      //- Quick selector
      .swiper-slide(:style="{ height: maxHeight }")
        .scroll.scrollerBlock
          //- Wallets
          .pt-5.pb-7
            .px-3.pb-2.text-skin-item-base.text-sm.font-semibold.font-nunito(
              @click="$store.commit('trnForm/showTrnFormModal', 'wallets')"
            ) {{ $t('wallets.title') }}

            WalletsList(
              :limit="4"
              #default="{ walletsItemsLimited }"
            )
              .px-3.grid.gap-y-1.gap-x-1.3sm_grid-cols-2
                //- Wallet
                TrnFormMainSelectedWallet(
                  v-for="(walletItem, walletId) in walletsItemsLimited"
                  :key="walletId"
                  :class="[{ 'cursor-default !bg-skin-item-main-active': $trnForm.values.walletId === walletId }]"
                  :id="walletId"
                  isHideDots
                  @click="id => $trnForm.values.walletId = id"
                )

          //- Favorite categories
          .pb-7(v-if="$store.getters['categories/favoriteCategoriesIds'].length > 0")
            .px-3.pb-2.text-skin-item-base.text-sm.font-semibold.font-nunito(
              @click="$store.commit('trnForm/showTrnFormModal', 'categories')"
            ) {{ $t('categories.favoriteTitle') }} {{ $t('categories.title') }}

            .px-3
              CategoriesList(
                v-if="sliderObj"
                :ids="$store.getters['categories/favoriteCategoriesIds']"
                :activeItemId="$trnForm.values.categoryId"
                :slider="sliderObj"
                class="!gap-x-1"
                @click="id => $trnForm.values.categoryId = id"
              )

          //- Recent categories
          .pb-7(v-if="$store.getters['categories/recentCategoriesIds'].length > 0")
            .px-3.pb-2.text-skin-item-base.text-sm.font-semibold.font-nunito(
              @click="$store.commit('trnForm/showTrnFormModal', 'categories')"
            ) {{ $t('categories.lastUsedTitle') }} {{ $t('categories.title') }}

            .px-3
              CategoriesList(
                v-if="sliderObj"
                :ids="$store.getters['categories/recentCategoriesIds']"
                :activeItemId="$trnForm.values.categoryId"
                :slider="sliderObj"
                class="!gap-x-1"
                @click="id => $trnForm.values.categoryId = id"
              )

  .trnForm__pagination

  //- Modals
  Portal(to="modal")
    TrnFormModals
</template>

<style lang="stylus">
.trnForm
  &__pagination
    z-index 2
    position absolute
    left 50%
    bottom 1px
    display flex
    align-items center
    justify-content center
    width auto
    padding $m5
    background alpha(#171717, .9)
    border-radius $m5
    transform translateX(-50%)

    /.light &
      background var(--c-bg-3)

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

        /.light &
          background var(--c-blue-1)
</style>

<style lang="stylus" scoped>
// TODO: style
.trnForm
  overflow hidden
  width 100%
  height auto
  background var(--c-bg-3)
  border-radius $m8 $m8 0 0

  +media(600px)
    border-radius 16px

.scroll
  overflow hidden
  overflow-y auto
  height 100%
  scrollbar()
</style>
