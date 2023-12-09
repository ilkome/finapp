<script setup lang="ts">
import SwiperCore from 'swiper'
import 'swiper/swiper-bundle.css'
import type { CategoryId } from '../categories/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const emit = defineEmits<{
  (e: 'click', id: CategoryId): void
}>()

const $trnForm = useTrnFormStore()
const sliderObj = ref()
const sliderRef = ref()

function onClick(categoryId: CategoryId) {
  emit('click', categoryId)
}

onMounted(() => {
  const initialSlide = 1

  sliderObj.value = new SwiperCore(sliderRef.value, {
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
    .swiper-container(ref="sliderRef")
      .swiper-wrapper
        //- Recent
        .swiper-slide
          .scrollBlock.scrollerBlock
            .py-4.px-3.text-center.text-item-base.text-xl.font-nunito.font-semibold.bg-layout-main.rounded-t-2xl
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
            .py-4.px-3.text-center.text-item-base.text-xl.font-nunito.font-semibold.bg-layout-main.rounded-t-2xl
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
            .py-4.px-3.text-center.text-item-base.text-xl.font-nunito.font-semibold.bg-layout-main.rounded-t-2xl
              | {{ $t('categories.favoriteTitle') }} {{ $t('categories.title') }}
            .pb-1.px-3
              CategoriesList(
                :activeItemId="$trnForm?.values?.categoryId"
                :ids="$store.getters['categories/favoriteCategoriesIds']"
                class="!gap-x-1"
                @click="onClick"
              )

  .py-2.px-3(v-if="sliderObj")
    UiTabs
      UiTabsItem(
        :isActive="sliderObj.activeIndex === 0"
        @click="sliderObj.slideTo(0)"
      ) {{ $t('categories.lastUsedTitle') }}

      UiTabsItem(
        :isActive="sliderObj.activeIndex === 1"
        @click="sliderObj.slideTo(1)"
      ) {{ $t('categories.allTitle') }}

      UiTabsItem(
        :isActive="sliderObj.activeIndex === 2"
        @click="sliderObj.slideTo(2)"
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
