<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = withDefaults(defineProps<{
  maxHeight: string
}>(), {
  maxHeight: '60vh',
})

const categoriesStore = useCategoriesStore()
const trnFormStore = useTrnFormStore()
const walletsStore = useWalletsStore()
const { width } = useWindowSize()
const { pointerType } = usePointer()

const isLaptop = computed(() => width.value >= 1024 && pointerType.value === 'mouse')

const walletId = computed(() => {
  const walletsIds = Object.keys(walletsStore.items ?? {})
  const walletId = walletsIds[0]
  return trnFormStore.values.walletId ?? walletId
})

const isShow = ref(false)
const initialSlide = ref(0)
function show(slide: number) {
  isShow.value = true
  initialSlide.value = slide
}
</script>

<template>
  <div>
    <TrnFormSelection
      v-if="isShow"
      v-model:isShow="isShow"
      :maxHeight="props.maxHeight"
      :initialSlide
    />

    <UiTitle
      class="pb-2 pt-1.5"
      @click="trnFormStore.values.trnId = null"
    >
      {{ trnFormStore.values.trnId
        ? $t("trnForm.titleEditTrn")
        : $t("trnForm.createTrn")
      }}
    </UiTitle>

    <TrnFormDate class="pb-2" />
    <TrnFormMainAmountTrn v-if="trnFormStore.values.trnType !== 2" />
    <TrnFormMainAmountTransfer
      v-if="trnFormStore.values.trnType === 2"
      isLaptop
      @onOpen="show(0)"
    />

    <TrnFormMainCalculator
      :amountRaw="trnFormStore.values.amountRaw[trnFormStore.activeAmountIdx]"
      class="pb-3"
      @onChange="trnFormStore.onChangeAmount"
    />

    <!-- Selected -->
    <div
      v-if="trnFormStore.values.trnType !== 2"
      class="grid grid-cols-2 gap-3 pb-3"
    >
      <TrnFormSelectorWallet
        v-if="walletId"
        :walletId
        :isLaptop
        @onOpen="show(0)"
        @onSelected="id => trnFormStore.values.walletId = id"
      />

      <TrnFormSelectorCategory
        v-if="trnFormStore.values.categoryId"
        :categoryId="trnFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
        :category="categoriesStore.items[trnFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]]"
        :isLaptop
        @onOpen="show(2)"
        @onSelected="id => trnFormStore.values.categoryId = id"
      />
    </div>

    <TrnFormMainTypes />
  </div>
</template>
