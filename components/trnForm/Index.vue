<script setup lang="ts">
import Swiper, { Pagination } from 'swiper'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
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
const sliderRef = ref<any>(null)
const sliderObj = ref<any>(null)
const maxHeight = ref('550px')

function setTrnFormHeight() {
  const el = document.querySelector('.getHeight')

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
      // centeredSlides: true,
      init: false,
      initialSlide: 1,
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
    setTrnFormHeight()
    sliderObj.value.init()
  }
}

onMounted(init)
</script>

<template>
  <BaseBottomSheet2
    :isShow="isShow"
    drugClassesCustom="md_bottom-1/2 md_-translate-x-1/2 md_translate-y-1/2"
    @closed="trnFormStore.onClose()"
  >
    <template #handler="{ close }">
      <BaseBottomSheetHandler />
      <!-- <BaseBottomSheetClose @onClick="close" /> -->
    </template>

    <div class="trnForm lg_ml-12">
      <div ref="sliderRef" class="swiper-container">
        <div class="swiper-wrapper">
          <!-- History -->
          <div
            class="swiper-slide bg-foreground-2 sm_max-w-xs sm_rounded-l-xl"
            :style="{ height: maxHeight }"
          >
            <TrnFormTrnsSlide
              v-if="sliderObj"
              :slider="sliderObj"
              class="px-2 pt-4 pb-6"
            />
          </div>

          <!-- Main -->
          <div
            class="swiper-slide getHeight sm_max-w-sm sm_px-3 bg-foreground-2 sm_max-w-sm _sm_rounded-xl sm_border-r sm_border-l border-item-5"
          >
            <div
              class="scroll scrollerBlock"
            >
              <TrnFormMain
                :maxHeight
                class="px-2 pt-4 pb-6"
              />
            </div>
          </div>

          <!-- Quick selector -->
          <div
            class="swiper-slide bg-foreground-2 sm_max-w-[260px] sm_rounded-r-xl"
            :style="{ height: maxHeight }"
          >
            <div class="scroll scrollerBlock">
              <div class="pb-4 pt-4">
                <!-- Wallets -->
                <div class="pb-6">
                  <UiTitle
                    class="px-3 pb-2 pt-1.5"
                    @click="trnFormStore.openTrnFormModal('wallets')"
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
                      :activeItemId="trnFormStore.values.walletId"
                      :walletId
                      :wallet
                      isHideDots
                      alt
                      @click="trnFormStore.values.walletId = walletId"
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
                    @click="trnFormStore.ui.catsRootModal = true"
                  >
                    {{ $t("categories.favoriteTitle") }}
                    {{ $t("categories.title") }}
                  </UiTitle>
                  <div class="px-3">
                    <CategoriesList
                      v-if="sliderObj"
                      :ids="categoriesStore.favoriteCategoriesIds"
                      :activeItemId="trnFormStore.values.categoryId"
                      :slider="sliderObj"
                      class="!gap-x-1"
                      @click="(id) => (trnFormStore.values.categoryId = id)"
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
                    @click="trnFormStore.ui.catsRootModal = true"
                  >
                    {{ $t("categories.lastUsedTitle") }}
                    {{ $t("categories.title") }}
                  </UiTitle>
                  <div class="px-3">
                    <CategoriesList
                      v-if="sliderObj"
                      :ids="categoriesStore.recentCategoriesIds"
                      :activeItemId="trnFormStore.values.categoryId"
                      :slider="sliderObj"
                      class="!gap-x-1"
                      @click="(id) => (trnFormStore.values.categoryId = id)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="trnForm__pagination" />
    </div>
  </BaseBottomSheet2>

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
