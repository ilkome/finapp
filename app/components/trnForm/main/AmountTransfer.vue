<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { type TransferType, TrnType } from '~/components/trns/types'
import { getStyles } from '~/components/ui/getStyles'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
  isLaptop: boolean
}>()

const emit = defineEmits<{
  onOpen: [slide: number]
}>()

const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()
const { t } = useI18n()

const items = ref<Record<MoneyTypeSlug, { amountsIdx: 1 | 2, transferType: TransferType }>>({
  expense: {
    amountsIdx: 1,
    transferType: 0,
  },
  income: {
    amountsIdx: 2,
    transferType: 1,
  },
})

const incomeWalletId = computed<WalletId | undefined>(
  () => trnsFormStore.values.incomeWalletId ?? walletsStore.sortedIds[0],
)

const expenseWalletId = computed<WalletId | undefined>(
  () => trnsFormStore.values.expenseWalletId ?? walletsStore.sortedIds[1],
)

watch(
  () => trnsFormStore.values.trnType,
  (trnType) => {
    if (trnType === TrnType.Transfer) {
      incomeWalletId.value && (trnsFormStore.values.incomeWalletId = incomeWalletId.value)
      expenseWalletId.value && (trnsFormStore.values.expenseWalletId = expenseWalletId.value)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="pb-2">
    <div class="flex flex-col">
      <div
        v-for="(item, slug) in items"
        :key="slug"
        :class="[{
          'border-accent-1': trnsFormStore.values.transferType === item.transferType,
        }, getStyles('item', ['rounded'])]"
        class="overflow-hidden border border-transparent"
        @click="trnsFormStore.onChangeTransferType(item.transferType)"
      >
        <div class="flex items-center gap-2 whitespace-nowrap">
          <div
            :class="[getStyles('item', ['bg2', 'link', 'rounded']), {
              'bg-item-hover': trnsFormStore.values.transferType === item.transferType,
            }]"
            class="flex min-h-[44px] w-1/2 grow items-center px-3 py-2 text-sm text-1/70 lg:min-h-[42px]"
          >
            {{ t(slug) }}
          </div>

          <TrnFormSelectorWallet
            v-if="slug === 'income' && incomeWalletId"
            :bottomSheetStyle="props.bottomSheetStyle"
            :isLaptop
            :title="t(slug)"
            :walletId="incomeWalletId"
            @onOpen="n => emit('onOpen', n)"
            @onSelected="id => trnsFormStore.values.incomeWalletId = id"
          />

          <TrnFormSelectorWallet
            v-if="slug === 'expense' && expenseWalletId"
            :bottomSheetStyle="props.bottomSheetStyle"
            :isLaptop
            :title="t(slug)"
            :walletId="expenseWalletId"
            @onOpen="n => emit('onOpen', n)"
            @onSelected="id => trnsFormStore.values.expenseWalletId = id"
          />
        </div>

        <!-- Input -->
        <TrnFormMainInput
          :key="item.amountsIdx"
          :amount="trnsFormStore.values.amount[item.amountsIdx]"
          :amountRaw="trnsFormStore.values.amountRaw[item.amountsIdx]"
          :highlight="item.transferType === 1 ? 'expense' : 'income'"
          :isShowSum="trnsFormStore.getIsShowSum()"
          isTransfer
          class="pb-2 pt-1"
          @onChange="trnsFormStore.onChangeAmount"
        />
      </div>
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  expense: Transfer from
  income: Transfer to

ru:
  expense: Перевод из
  income: Перевод в
</i18n>
