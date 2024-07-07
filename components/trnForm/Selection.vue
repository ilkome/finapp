<script setup lang="ts">
import Swiper, { Pagination } from 'swiper'
import type { CategoryId } from '../categories/types'
import type { WalletId } from '../wallets/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { getParentCategoryId } from '~/components/categories/getCategories'
import 'swiper/css'
import 'swiper/css/pagination'

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
      modules: [Pagination],
      pagination: {
        clickable: true,
        el: '.trnFormSelectionPagination',
      },
      shortSwipes: false,
    })
    sliderObj.value.init()
  }
})

const parentCategoryId = ref<CategoryId | false>(
  getParentCategoryId(categoriesStore.items, trnFormStore.values.categoryId)
  || trnFormStore.values.categoryId,
)

function onSelectWallet(id: WalletId, close: () => void) {
  trnFormStore.values.walletId = id
  close()
}

function onSelectCategory(id: CategoryId, close: () => void) {
  trnFormStore.values.categoryId = id
  close()
}

async function onSelectParentCategory(id: CategoryId) {
  parentCategoryId.value = id
  await nextTick()
  sliderObj.value.update()
  sliderObj.value.slideTo(3)
}
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet2
      :isShow="isShow"
      drugClassesCustom="bg-foreground-3"
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
            <div
              :style="{ height: props.maxHeight }"
              class="swiper-slide"
            >
              <div class="h-full overflow-y-auto scrollerBlock pb-3">
                <TrnFormSelectionWalletsAll
                  :maxHeight="maxHeight"
                  @onSelectWallet="id => onSelectWallet(id, close)"
                />
              </div>
            </div>

            <!-- Categories fast -->
            <div
              :style="{ height: props.maxHeight }"
              class="swiper-slide"
            >
              <div class="h-full overflow-y-auto scrollerBlock pb-3">
                <TrnFormSelectionCategoriesFast
                  @onSelectCategory="id => onSelectCategory(id, close)"
                  @onSelectParentCategory="id => onSelectParentCategory(id)"
                />
              </div>
            </div>

            <!-- Categories -->
            <TrnFormSelectionCategoriesAll
              :maxHeight="maxHeight"
              :parentCategoryId
              @onSelectCategory="id => onSelectCategory(id, close)"
              @onSelectParentCategory="id => onSelectParentCategory(id)"
            />

            <!-- Child Categories Slide -->
            <TrnFormSelectionCategoriesChild
              :maxHeight="maxHeight"
              :parentCategoryId
              @onSelectCategory="id => onSelectCategory(id, close)"
              @onSelectParentCategory="id => onSelectParentCategory(id)"
            />
          </div>
        </div>
        <div class="trnFormSelectionPagination" />
      </template>
    </BaseBottomSheet2>
  </Teleport>
</template>

<style>
.trnFormSelectionPagination.swiper-pagination-horizontal
  .swiper-pagination-bullet-active {
  @apply !bg-neutral-600 dark:!bg-white/80;
}
</style>

<style lang="stylus">
@import "../assets/stylus/variables"
.trnFormSelectionPagination
  &.swiper-pagination-horizontal
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
    transform translateX(-50%)

    .swiper-pagination-bullet
      opacity 1
      width 6px
      height 6px
      margin 0 4px
      background var(--c-bg-9)
      border-radius 50%
      anim()
</style>
