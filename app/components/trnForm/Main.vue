<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  maxHeight?: string
}>(), {
  maxHeight: '60vh',
})

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()
const { width } = useWindowSize()
const { pointerType } = usePointer()

const isLaptop = computed(() => width.value >= 766 && pointerType.value === 'mouse')

const walletId = computed(() => {
  const walletsIds = Object.keys(walletsStore.items ?? {})
  const walletId = walletsIds[0]
  return trnsFormStore.values.walletId ?? walletId
})

const isShow = ref(false)
const initialSlide = ref(0)
function show(slide: number) {
  isShow.value = true
  initialSlide.value = slide
}
</script>

<template>
  <div class="grid pb-0">
    <TrnFormSelection
      v-if="isShow"
      v-model:isShow="isShow"
      :maxHeight="props.maxHeight"
      :initialSlide
    />

    <UiTitleModal @click="trnsFormStore.values.trnId = null">
      {{ trnsFormStore.values.trnId ? t('trnForm.titleEditTrn') : t('trnForm.createTrn') }}
    </UiTitleModal>

    <TrnFormEditedTrn v-if="trnsFormStore.values.trnId" />
    <TrnFormDate class="px-3 pb-0 " />

    <div class="px-3 pb-2">
      <TrnFormMainTypes />
    </div>

    <TrnFormMainInput
      v-if="trnsFormStore.values.trnType !== 2"
      :amount="trnsFormStore.values.amount[trnsFormStore.activeAmountIdx]"
      :amountRaw="trnsFormStore.values.amountRaw[trnsFormStore.activeAmountIdx]"
      :highlight="trnsFormStore.values.trnType === 0 ? 'expense' : 'income'"
      :isShowSum="trnsFormStore.getIsShowSum()"
      class="px-3 pb-2"
      @onChange="trnsFormStore.onChangeAmount"
    />

    <div class="grid gap-3 px-3 pb-6">
      <!-- Selected -->
      <div
        v-if="trnsFormStore.values.trnType !== 2"
        class="grid grid-cols-2 gap-2"
      >
        <TrnFormSelectorWallet
          v-if="walletId"
          :bottomSheetStyle="{ maxHeight: props.maxHeight }"
          :isLaptop
          :title="t('trnForm.wallet.select')"
          :walletId="walletId"
          @onOpen="show(0)"
          @onSelected="(id: WalletId) => trnsFormStore.values.walletId = id"
        />

        <TrnFormSelectorCategory
          v-if="trnsFormStore.values.categoryId"
          :bottomSheetStyle="{ maxHeight: props.maxHeight }"
          :category="categoriesStore.items[trnsFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]]"
          :categoryId="trnsFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
          :isLaptop
          :title="t('trnForm.category.select')"
          @onOpen="show(2)"
          @onSelected="(id: CategoryId) => trnsFormStore.values.categoryId = id"
        />
      </div>

      <TrnFormMainAmountTransfer
        v-if="trnsFormStore.values.trnType === 2"
        :bottomSheetStyle="{ maxHeight: props.maxHeight }"
        isLaptop
        @onOpen="show(0)"
      />

      <TrnFormMainCalculator />
    </div>
  </div>
</template>

<style lang="css">
@reference '~/assets/css/main.css';

.trnForm {
  padding-bottom: calc(env(safe-area-inset-bottom) - 16px);

  .trnForm__pagination {
    @apply absolute left-1/2 z-[2] flex items-center justify-center w-auto p-1.5 rounded-md bg-[var(--item-1)];
    transform: translateX(-50%);
    bottom: 1px;
  }

  .swiper-pagination-bullet {
    @apply block w-1.5 h-1.5 mx-1 rounded-full bg-item-4;
    opacity: 1;
  }

  .swiper-pagination-bullet-active {
    @apply bg-(--ui-primary);
  }
}
</style>
