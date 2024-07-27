<script setup lang="ts">
import { usePointer, useWindowSize } from '@vueuse/core'
import type { WalletId } from '../wallets/types'
import type { CategoryId } from '../categories/types'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import useTrn from '~/components/trns/useTrn'
import { getStyles } from '~/components/ui/getStyles'

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
const { formatTrnItem } = useTrn()

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
  <div class="grid px-3 pt-1 pb-6">
    <TrnFormSelection
      v-if="isShow"
      v-model:isShow="isShow"
      :maxHeight="props.maxHeight"
      :initialSlide
    />

    <UiTitle
      :class="getStyles('item', ['center', 'minh2', 'minw1', 'rounded'])"
      class="!text-3 !text-sm !font-semibold !font-nunito"
      @click="trnFormStore.values.trnId = null"
    >
      {{ trnFormStore.values.trnId
        ? $t("trnForm.titleEditTrn")
        : $t("trnForm.createTrn")
      }}
    </UiTitle>

    <div
      v-if="trnFormStore.values.trnId"
      class="pb-2"
    >
      <TrnsItem
        :trnItem="formatTrnItem(trnFormStore.values.trnId)"
        :date="formatDate(formatTrnItem(trnFormStore.values.trnId)?.date, 'trnItem')"
        class="group bg-item-4 rounded-lg !py-1"
        @click="trnFormStore.values.trnId = null"
      />
    </div>

    <TrnFormDate class="pb-0" />

    <TrnFormMainInput
      v-if="trnFormStore.values.trnType !== 2"
      :amount="trnFormStore.values.amount[trnFormStore.activeAmountIdx]"
      :amountRaw="trnFormStore.values.amountRaw[trnFormStore.activeAmountIdx]"
      :highlight="trnFormStore.values.trnType === 0 ? 'income' : 'expense'"
      :isShowSum="trnFormStore.getIsShowSum()"
      class="pb-2"
      @onChange="trnFormStore.onChangeAmount"
    />

    <div class="grid gap-3 pb-6">
      <!-- Selected -->
      <div
        v-if="trnFormStore.values.trnType !== 2"
        class="grid gap-2"
      >
        <TrnFormSelectorWallet
          v-if="walletId"
          :walletId
          :isLaptop
          @onOpen="show(0)"
          @onSelected="(id: WalletId) => trnFormStore.values.walletId = id"
        />

        <TrnFormSelectorCategory
          v-if="trnFormStore.values.categoryId"
          :categoryId="trnFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
          :category="categoriesStore.items[trnFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]]"
          :isLaptop
          @onOpen="show(2)"
          @onSelected="(id: CategoryId) => trnFormStore.values.categoryId = id"
        />
      </div>

      <TrnFormMainAmountTransfer
        v-if="trnFormStore.values.trnType === 2"
        isLaptop
        @onOpen="show(0)"
      />

      <TrnFormMainCalculator
        :amountRaw="trnFormStore.values.amountRaw[trnFormStore.activeAmountIdx]"
        @onChange="trnFormStore.onChangeAmount"
      />

      <TrnFormMainTypes />
    </div>
  </div>
</template>
