<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { CategoryId } from '~/components/categories/types'
import type { WalletId } from '~/components/wallets/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useTrnFormSubmit } from '~/components/trnForm/useTrnFormSubmit'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { maxHeight = '60vh', sidebarHeader = false } = defineProps<{
  maxHeight?: string
  sidebarHeader?: boolean
}>()

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()
const { submit } = useTrnFormSubmit()
const walletId = computed(() =>
  trnsFormStore.values.walletId ?? walletsStore.sortedIds[0],
)

const editedTrnItem = computed(() => trnsFormStore.values.trnId ? trnsStore.computeTrnItem(trnsFormStore.values.trnId) : undefined)

const typeItems = computed<TabsItem[]>(() => [
  { label: t('money.expense'), value: TrnType.Expense },
  { label: t('money.income'), value: TrnType.Income },
  // A transfer needs a second wallet to go to.
  ...(walletsStore.sortedIds.length > 1 ? [{ label: t('trnForm.transferTitle'), value: TrnType.Transfer }] : []),
])
</script>

<template>
  <div class="grid pb-6">
    <div
      v-if="sidebarHeader"
      class="sticky top-0 z-20 bg-default/90 px-4 pt-5 pb-3 backdrop-blur"
      @click="trnsFormStore.values.trnId = null"
    >
      <UiHeaderTitle class="md:text-xl">
        {{ trnsFormStore.values.trnId ? t('trnForm.titleEditTrn') : t('trnForm.createTrn') }}
      </UiHeaderTitle>
    </div>
    <UiTitleModal v-else @click="trnsFormStore.values.trnId = null">
      {{ trnsFormStore.values.trnId ? t('trnForm.titleEditTrn') : t('trnForm.createTrn') }}
    </UiTitleModal>

    <div class="grid gap-3 px-3">
      <TrnsItem
        v-if="editedTrnItem"
        :trnItem="editedTrnItem"
        class="group mx-3 rounded-lg bg-elevated/50"
        @click="trnsFormStore.values.trnId = null"
      />

      <div class="flex items-center gap-1">
        <TrnFormDate />
        <TrnFormMainDescription />
      </div>

      <UiTabs
        isEqual
        :items="typeItems"
        :modelValue="trnsFormStore.values.trnType"
        @update:modelValue="(v) => trnsFormStore.onChangeTrnType(v as TrnType)"
      />

      <TrnFormMainInput
        v-if="trnsFormStore.values.trnType !== TrnType.Transfer"
        :amount="trnsFormStore.values.amount[trnsFormStore.activeAmountIdx]"
        :amountRaw="trnsFormStore.values.amountRaw[trnsFormStore.activeAmountIdx]"
        :highlight="trnsFormStore.values.trnType === TrnType.Expense ? 'expense' : 'income'"
        :isShowSum="trnsFormStore.shouldShowSum()"
        @change="trnsFormStore.onChangeAmount"
        @submit="submit"
      />

      <!-- Selected -->
      <TrnFormEntitySelector
        v-if="trnsFormStore.values.trnType !== TrnType.Transfer"
        :bottomSheetStyle="{ maxHeight }"
        :categoryId="trnsFormStore.values.categoryId ?? categoriesStore.categoriesIdsForTrnValues[0]"
        :walletId
        @selectCategory="(id: CategoryId) => trnsFormStore.values.categoryId = id"
        @selectWallet="(id: WalletId) => trnsFormStore.values.walletId = id"
      />

      <TrnFormMainAmountTransfer
        v-if="trnsFormStore.values.trnType === TrnType.Transfer"
        :bottomSheetStyle="{ maxHeight }"
      />

      <TrnFormMainCalculator />
    </div>
  </div>
</template>

<style lang="css">
@reference '../../assets/css/main.css';

.trnForm {
  padding-bottom: calc(env(safe-area-inset-bottom) - 16px);

  .trnForm__pagination {
    @apply absolute left-1/2 z-[2] flex items-center justify-center w-auto p-1.5 rounded-md bg-default;
    transform: translateX(-50%);
    bottom: 1px;
  }

  .swiper-pagination-bullet {
    @apply block w-1.5 h-1.5 mx-1 rounded-full bg-accented;
    opacity: 1;
  }

  .swiper-pagination-bullet-active {
    @apply bg-primary;
  }
}
</style>
