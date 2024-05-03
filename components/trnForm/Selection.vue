<script setup lang="ts">
import Swiper from 'swiper'
import type { CategoryId } from '../categories/types'
import type { WalletId } from '../wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import 'swiper/css'
import { getParentCategoryId } from '~/components/categories/getCategories'

const props = withDefaults(
  defineProps<{
    initialSlide: number
    maxHeight: string
  }>(),
  {
    initialSlide: 0,
    maxHeight: '60vh',
  },
)

const isShow = defineModel('isShow', {
  default: false,
})

const categoriesStore = useCategoriesStore()
const trnFormStore = useTrnFormStore()

const sliderRef = ref<any>(null)
const sliderObj = ref<any>(null)
onMounted(() => {
  if (!sliderObj.value) {
    sliderObj.value = new Swiper(sliderRef.value, {
      init: false,
      initialSlide: props.initialSlide,
      longSwipesMs: 60,
      longSwipesRatio: 0.1,
      shortSwipes: false,
    })
    sliderObj.value.init()
  }
})

const parentCategoryId = ref<CategoryId | false>(
  getParentCategoryId(categoriesStore.items, trnFormStore.values.categoryId)
  || trnFormStore.values.categoryId,
)

async function onSelectParentCategory(id: CategoryId) {
  parentCategoryId.value = id
  await nextTick()
  sliderObj.value.update()
  sliderObj.value.slideTo(3)
}

function onSelectWallet(id: WalletId, close: () => void) {
  trnFormStore.values.walletId = id
  close()
}

function onSelectCategory(id: CategoryId, close: () => void) {
  trnFormStore.values.categoryId = id
  close()
}
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet2
      :isShow="isShow"
      drugClassesCustom="md_w-96 bg-foreground-2 md_bg-transparent"
      @closed="isShow = false"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>

      <template #default="{ close }">
        <div ref="sliderRef" class="swiper-container">
          <div class="swiper-wrapper">
            <!-- Wallets -->
            <div class="swiper-slide py-4" :style="{ height: maxHeight }">
              <UiTitle class="px-3 pb-2 pt-1.5">
                {{ $t("wallets.title") }}
              </UiTitle>

              <WalletsSelector
                :hide="close"
                :activeItemId="trnFormStore.values.walletId"
                :style="{ maxHeight: props.maxHeight }"
                @onSelected="(id) => onSelectWallet(id, close)"
              />
            </div>

            <!-- Fast Categories -->
            <div class="swiper-slide overflow-y-auto" :style="{ height: maxHeight }">
              <!-- Favorite categories -->
              <div
                v-if="categoriesStore.favoriteCategoriesIds.length > 0"
              >
                <UiTitle
                  class="sticky top-0 pt-4 pb-2 px-3 bg-foreground-2"
                  @click="trnFormStore.ui.catsRootModal = true"
                >
                  {{ $t("categories.favoriteTitle") }}
                  {{ $t("categories.title") }}
                </UiTitle>

                <CategoriesSelector2
                  :activeItemId="trnFormStore.values.categoryId"
                  :hide="close"
                  :ids="categoriesStore.favoriteCategoriesIds"
                  @onClickParent="onSelectParentCategory"
                  @onSelected="id => trnFormStore.values.categoryId = id"
                />
              </div>

              <!-- Recent categories -->
              <div
                v-if="categoriesStore.recentCategoriesIds.length > 0"
              >
                <UiTitle
                  class="sticky pt-4 pb-2 top-0 px-3 bg-foreground-2"
                  @click="trnFormStore.ui.catsRootModal = true"
                >
                  {{ $t("categories.lastUsedTitle") }}
                  {{ $t("categories.title") }}
                </UiTitle>

                <CategoriesSelector2
                  :activeItemId="trnFormStore.values.categoryId"
                  :hide="close"
                  :ids="categoriesStore.recentCategoriesIds"
                  @onClickParent="onSelectParentCategory"
                  @onSelected="id => trnFormStore.values.categoryId = id"
                />

                <!-- <div class="px-3">
                  <CategoriesList
                    v-if="sliderObj"
                    :ids="categoriesStore.recentCategoriesIds"
                    :activeItemId="trnFormStore.values.categoryId"
                    :slider="sliderObj"
                    class="!gap-x-1"
                    @click="(id) => (trnFormStore.values.categoryId = id)"
                  />
                </div> -->
              </div>
            </div>

            <!-- Categories -->
            <div class="swiper-slide pt-4 grid grid-rows-[auto,1fr]" :style="{ height: maxHeight }">
              <UiTitle class="px-3 pb-2 pt-1.5">
                {{ $t("categories.title") }}
              </UiTitle>

              <div class="bg-item-4 overflow-y-auto">
                <CategoriesSelector2
                  :activeItemId="parentCategoryId || trnFormStore.values.categoryId"
                  :hide="close"
                  :ids="categoriesStore.categoriesRootIds"
                  @onClickParent="onSelectParentCategory"
                  @onSelected="id => trnFormStore.values.categoryId = id"
                />
              </div>
            </div>

            <div
              v-if="parentCategoryId && categoriesStore.items[parentCategoryId].childIds"
              class="swiper-slide pt-4 grid grid-rows-[auto,1fr]"
              :style="{ height: maxHeight }"
            >
              <UiTitle class="px-3 pb-2 pt-1.5">
                {{ categoriesStore.items[parentCategoryId].name }}
              </UiTitle>

              <div class="bg-item-4 overflow-y-auto">
                <CategoriesSelector2
                  :activeItemId="trnFormStore.values.categoryId"
                  :hide="close"
                  :ids="categoriesStore.items[parentCategoryId].childIds"
                  @onClickParent="onSelectParentCategory"
                  @onSelected="id => trnFormStore.values.categoryId = id"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>
