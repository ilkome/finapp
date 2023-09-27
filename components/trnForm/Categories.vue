<script setup lang="ts">
import SwiperCore from 'swiper'
import 'swiper/swiper-bundle.css'
import type { CategoryId } from '../categories/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const emit = defineEmits<{
  (e: 'closeModal'): void
}>()

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()
const slider = ref()
const trnFormCategories = ref()

function onClick(categoryId: CategoryId) {
  if ($store.getters['categories/isCategoryHasChildren'](categoryId)) {
    $store.commit('trnForm/setTrnFormModalCategoryId', categoryId)
    $store.commit('trnForm/showTrnFormModal', 'categoriesChild')
  }
  else {
    $trnForm.values.categoryId = categoryId
    emit('closeModal')
  }
}

onMounted(() => {
  const initialSlide = 1

  slider.value = new SwiperCore(trnFormCategories.value, {
    observer: true,
    observeParents: true,
    slidesPerView: 1,
    touchStartPreventDefault: false,
    autoHeight: false,
    initialSlide,
    shortSwipes: false,
    longSwipesRatio: 0.1,
    longSwipesMs: 60,
  })
})
</script>

<template lang="pug">
.contentWrap.h-full.grid(class="grid-rows-[1fr,auto]")
  .contentWrap__box
    .swiper-container(ref="trnFormCategories")
      .swiper-wrapper
        //- Recent
        .swiper-slide
          .scrollBlock.scrollerBlock
            .py-4.px-3.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold.bg-skin-layout-main.rounded-t-2xl
              | {{ $t('categories.lastUsedTitle') }} {{ $t('categories.title') }}
            .pb-1.px-3
              CategoriesList(
                :activeItemId="$trnForm?.values?.categoryId"
                :ids="$store.getters['categories/recentCategoriesIds']"
                class="!gap-x-1"
                @click="onClick"
              )

        //- Main
        .swiper-slide
          .scrollBlock.scrollerBlock
            .py-4.px-3.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold.bg-skin-layout-main.rounded-t-2xl
              | {{ $t('categories.title') }}
            .pb-1.px-3
              CategoriesList(
                :activeItemId="$trnForm?.values?.categoryId"
                :ids="$store.getters['categories/categoriesRootIds']"
                class="!gap-x-1"
                @click="onClick"
              )

        //- Favorite
        .swiper-slide
          .scrollBlock.scrollerBlock
            .py-4.px-3.text-center.text-skin-item-base.text-xl.font-nunito.font-semibold.bg-skin-layout-main.rounded-t-2xl
              | {{ $t('categories.favoriteTitle') }} {{ $t('categories.title') }}
            .pb-1.px-3
              CategoriesList(
                :activeItemId="$trnForm?.values?.categoryId"
                :ids="$store.getters['categories/favoriteCategoriesIds']"
                class="!gap-x-1"
                @click="onClick"
              )

  .py-2.px-3(v-if="slider")
    UiTabs
      UiTabsItem(
        :isActive="slider.activeIndex === 0"
        @click="slider.slideTo(0)"
      ) {{ $t('categories.lastUsedTitle') }}

      UiTabsItem(
        :isActive="slider.activeIndex === 1"
        @click="slider.slideTo(1)"
      ) {{ $t('categories.allTitle') }}

      UiTabsItem(
        :isActive="slider.activeIndex === 2"
        @click="slider.slideTo(2)"
      ) {{ $t('categories.favoriteTitle') }}
</template>

<style lang="stylus" scoped>
.contentWrap
  overflow hidden
  position relative

  &__box
    overflow hidden
    height 100%

  .swiper-container
  .swiper-container .swiper-slide
    height 100%

.scrollBlock
  overflow hidden
  display grid
  align-items flex-end
  overflowScrollY()
  width 100%
  height 100%

  +media-laptop()
    align-items center
</style>
