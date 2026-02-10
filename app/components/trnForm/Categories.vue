<script setup lang="ts">
import Swiper from 'swiper'
import 'swiper/css'

import type { CategoryId } from '~/components/categories/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const emit = defineEmits<{
  (e: 'click', id: CategoryId): void
}>()

const trnsFormStore = useTrnsFormStore()
const categoriesStore = useCategoriesStore()

const sliderObj = ref()
const sliderRef = ref()

function onClick(categoryId: CategoryId) {
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
  <div class="relative grid h-full grid-rows-[1fr_auto] overflow-hidden">
    <div class="h-full overflow-hidden">
      <div ref="sliderRef" class="swiper-container h-full">
        <div class="swiper-wrapper">
          <!-- Recent -->
          <div class="swiper-slide h-full">
            <div
              class="scrollerBlock font-primary rounded-t-2xl bg-[var(--item-1)] px-3 py-4 text-center text-xl font-semibold"
            >
              {{ $t('categories.recentCategories') }}
            </div>
            <div class="px-3 pb-1">
              <CategoriesList
                :activeItemId="trnsFormStore?.values?.categoryId"
                :ids="categoriesStore.recentCategoriesIds"
                class="!gap-x-1"
                @click="onClick"
              />
            </div>
          </div>

          <!-- Main -->
          <div class="swiper-slide h-full">
            <div
              class="scrollerBlock font-primary rounded-t-2xl bg-[var(--item-1)] px-3 py-4 text-center text-xl font-semibold"
            >
              {{ $t('categories.title') }}
            </div>
            <div class="px-3 pb-1">
              <CategoriesList
                :activeItemId="trnsFormStore?.values?.categoryId"
                :ids="categoriesStore.categoriesRootIds"
                class="!gap-x-1"
                @click="onClick"
              />
            </div>
          </div>

          <!-- Favorite -->
          <div class="swiper-slide h-full">
            <div class="scrollerBlock font-primary rounded-t-2xl bg-[var(--item-1)] px-3 py-4 text-center text-xl font-semibold">
              {{ $t('categories.favoriteCategories') }}
            </div>
            <div class="px-3 pb-1">
              <CategoriesList
                :activeItemId="trnsFormStore?.values?.categoryId"
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
      <UiTabs1>
        <UiTabsItem1
          :isActive="sliderObj.activeIndex === 0"
          @click="sliderObj.slideTo(0)"
        >
          {{ $t('categories.recentCategories') }}
        </UiTabsItem1>

        <UiTabsItem1
          :isActive="sliderObj.activeIndex === 1"
          @click="sliderObj.slideTo(1)"
        >
          {{ $t('categories.allTitle') }}
        </UiTabsItem1>

        <UiTabsItem1
          :isActive="sliderObj.activeIndex === 2"
          @click="sliderObj.slideTo(2)"
        >
          {{ $t('categories.favoriteCategories') }}
        </UiTabsItem1>
      </UiTabs1>
    </div>
  </div>
</template>
