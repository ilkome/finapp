<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { useCategoriesStore } from '~/components/categories/useCategories';
import { useTrnFormStore } from '~/components/trnForm/useTrnForm';
import Swiper, { Pagination } from 'swiper';
import 'swiper/css'
import 'swiper/css/pagination'

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
      centeredSlides: true,
      init: false,
      initialSlide: 1,
      longSwipesMs: 60,
      longSwipesRatio: 0.1,
      modules: [Pagination],
      observeParents: true,
      observer: true,
      pagination: {
        clickable: true,
        el: '.trnForm__pagination',
      },
      shortSwipes: false,

      slidesPerView: 'auto',
    })
    setTrnFormHeight()
    sliderObj.value.init()
  }
}

onMounted(init)
</script>

<template>
  <div class="trnForm">
    <div ref="sliderRef" class="swiper-container">
      <div class="swiper-wrapper rounded-xl">
        <!-- History -->
        <div
          class="swiper-slide bg-foreground-2 sm_max-w-sm sm_rounded-xl"
          :style="{ height: maxHeight }"
        >
          <TrnFormTrnsSlide
            v-if="sliderObj"
            :slider="sliderObj"
            class="px-3 pb-3 pt-4"
          />
        </div>

        <!-- Main -->
        <div
          class="swiper-slide getHeight max-w-sm bg-foreground-2 sm_mx-6 sm_max-w-sm sm_rounded-xl"
        >
          <div
            class="scroll scrollerBlock"
            :style="{ maxHeight: `${height}px` }"
          >
            <TrnFormMain />
          </div>
        </div>

        <!-- Quick selector -->
        <div
          class="swiper-slide bg-foreground-2 sm_max-w-sm sm_rounded-xl"
          :style="{ height: maxHeight }"
        >
          <div class="scroll scrollerBlock">
            <div class="pb-4 pt-4">
              <!-- Wallets -->
              <div class="pb-6">
                <UiTitle
                  class="px-3 pb-2 pt-1.5"
                  @click="$trnForm.openTrnFormModal('wallets')"
                >
                  {{ $t("wallets.title") }}
                </UiTitle>
                <WalletsList
                  v-slot="{ walletsItemsLimited }"
                  :limit="5"
                  class="px-3"
                >
                  <!-- Wallet -->
                  <WalletsItem
                    v-for="(wallet, walletId) in walletsItemsLimited"
                    :key="walletId"
                    :activeItemId="$trnForm.values.walletId"
                    :walletId
                    :wallet
                    isHideDots
                    @click="$trnForm.values.walletId = walletId"
                  />
                </WalletsList>
              </div>

              <!-- Favorite categories -->
              <div
                v-if="categoriesStore.favoriteCategoriesIds.length > 0"
                class="pb-6"
              >
                <UiTitle
                  class="px-3 pb-2"
                  @click="$trnForm.ui.catsRootModal = true"
                >
                  {{ $t("categories.favoriteTitle") }}
                  {{ $t("categories.title") }}
                </UiTitle>
                <div class="px-3">
                  <CategoriesList
                    v-if="sliderObj"
                    :ids="categoriesStore.favoriteCategoriesIds"
                    :activeItemId="$trnForm.values.categoryId"
                    :slider="sliderObj"
                    class="!gap-x-1"
                    @click="(id) => ($trnForm.values.categoryId = id)"
                  />
                </div>
              </div>

              <!-- Recent categories -->
              <div
                v-if="categoriesStore.recentCategoriesIds.length > 0"
                class="pb-6"
              >
                <UiTitle
                  class="px-3 pb-2"
                  @click="$trnForm.ui.catsRootModal = true"
                >
                  {{ $t("categories.lastUsedTitle") }}
                  {{ $t("categories.title") }}
                </UiTitle>
                <div class="px-3">
                  <CategoriesList
                    v-if="sliderObj"
                    :ids="categoriesStore.recentCategoriesIds"
                    :activeItemId="$trnForm.values.categoryId"
                    :slider="sliderObj"
                    class="!gap-x-1"
                    @click="(id) => ($trnForm.values.categoryId = id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="trnForm__pagination" />

    <!-- Modals -->
    <LazyTrnFormModalDescription v-if="$trnForm.modal.description" />
  </div>
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
