<script setup lang="ts">
import Swiper from 'swiper'
import 'swiper/css'
import type { CategoryId } from '~/components/categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'

const emit = defineEmits<{
  (e: 'click', id: CategoryId): void
}>()

const trnFormStore = useTrnFormStore()
const categoriesStore = useCategoriesStore()

const sliderObj = ref()
const sliderRef = ref()

function onClick(categoryId: CategoryId) {
  console.log(1, 'categoryId', categoryId)
  emit('click', categoryId)
}

onMounted(() => {
  const initialSlide = 1

  sliderObj.value = new Swiper(sliderRef.value, {
    autoHeight: false,
    initialSlide,
    longSwipesMs: 60,
    longSwipesRatio: 0.1,
    observeParents: true,
    observer: true,
    shortSwipes: false,
    slidesPerView: 1,
    touchStartPreventDefault: false,
  })
})
</script>

<template>
  <div class="contentWrap grid h-full grid-rows-[1fr,auto]">
    <div class="contentWrap__box">
      <div ref="sliderRef" class="swiper-container">
        <div class="swiper-wrapper">
          <!-- Recent -->
          <div class="swiper-slide">
            <div
              class="scrollBlock scrollerBlock text-item-base rounded-t-2xl bg-foreground-3 px-3 py-4 text-center font-primary text-xl font-semibold"
            >
              {{ $t("categories.lastUsedTitle") }} {{ $t("categories.title") }}
            </div>
            <div class="px-3 pb-1">
              <CategoriesList
                :activeItemId="trnFormStore?.values?.categoryId"
                :ids="categoriesStore.recentCategoriesIds"
                class="!gap-x-1"
                @click="onClick"
              />
            </div>
          </div>

          <!-- Main -->
          <div class="swiper-slide">
            <div
              class="scrollBlock scrollerBlock text-item-base rounded-t-2xl bg-foreground-3 px-3 py-4 text-center font-primary text-xl font-semibold"
            >
              {{ $t("categories.title") }}
            </div>
            <div class="px-3 pb-1">
              <CategoriesList
                :activeItemId="trnFormStore?.values?.categoryId"
                :ids="categoriesStore.categoriesRootIds"
                class="!gap-x-1"
                @click="onClick"
              />
            </div>
          </div>

          <!-- Favorite -->
          <div class="swiper-slide">
            <div
              class="scrollBlock scrollerBlock text-item-base rounded-t-2xl bg-foreground-3 px-3 py-4 text-center font-primary text-xl font-semibold"
            >
              {{ $t("categories.favoriteTitle") }} {{ $t("categories.title") }}
            </div>
            <div class="px-3 pb-1">
              <CategoriesList
                :activeItemId="trnFormStore?.values?.categoryId"
                :ids="categoriesStore.favoriteCategoriesIds"
                class="!gap-x-1"
                @click="onClick"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="sliderObj" class="px-3 py-2">
      <UiTabs>
        <UiTabsItem
          :isActive="sliderObj.activeIndex === 0"
          @click="sliderObj.slideTo(0)"
        >
          {{ $t("categories.lastUsedTitle") }}
        </UiTabsItem>

        <UiTabsItem
          :isActive="sliderObj.activeIndex === 1"
          @click="sliderObj.slideTo(1)"
        >
          {{ $t("categories.allTitle") }}
        </UiTabsItem>

        <UiTabsItem
          :isActive="sliderObj.activeIndex === 2"
          @click="sliderObj.slideTo(2)"
        >
          {{ $t("categories.favoriteTitle") }}
        </UiTabsItem>
      </UiTabs>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables/*"

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
