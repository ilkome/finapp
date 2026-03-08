<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import type { TransferSide } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
}>()

const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()
const { t } = useI18n()

const items = ref<Record<MoneyTypeSlug, { amountsIdx: 1 | 2, transferType: TransferSide }>>({
  expense: {
    amountsIdx: 1,
    transferType: 'expense',
  },
  income: {
    amountsIdx: 2,
    transferType: 'income',
  },
})

const incomeWalletId = computed<WalletId | undefined>(
  () => trnsFormStore.values.incomeWalletId ?? walletsStore.sortedIds[0],
)

const expenseWalletId = computed<WalletId | undefined>(
  () => trnsFormStore.values.expenseWalletId ?? walletsStore.sortedIds[1] ?? walletsStore.sortedIds[0],
)

watch(
  () => trnsFormStore.values.trnType,
  (trnType) => {
    if (trnType === TrnType.Transfer) {
      if (!trnsFormStore.values.incomeWalletId)
        incomeWalletId.value && (trnsFormStore.values.incomeWalletId = incomeWalletId.value)

      if (!trnsFormStore.values.expenseWalletId)
        expenseWalletId.value && (trnsFormStore.values.expenseWalletId = expenseWalletId.value)

      if (trnsFormStore.values.amount[1] === 0) {
        trnsFormStore.values.amount[1] = trnsFormStore.values.amount[0]
        trnsFormStore.values.amountRaw[1] = trnsFormStore.values.amountRaw[0]
      }
    }
  },
  { immediate: true },
)

function switchWallets() {
  const incomeWalletId = trnsFormStore.values.incomeWalletId
  const expenseWalletId = trnsFormStore.values.expenseWalletId
  const incomeAmount = trnsFormStore.values.amount[1]
  const incomeAmountRaw = trnsFormStore.values.amountRaw[1]
  const expenseAmount = trnsFormStore.values.amount[2]
  const expenseAmountRaw = trnsFormStore.values.amountRaw[2]

  trnsFormStore.values.incomeWalletId = expenseWalletId
  trnsFormStore.values.expenseWalletId = incomeWalletId
  trnsFormStore.values.amount[1] = expenseAmount
  trnsFormStore.values.amountRaw[1] = expenseAmountRaw
  trnsFormStore.values.amount[2] = incomeAmount
  trnsFormStore.values.amountRaw[2] = incomeAmountRaw
}

function copyAmount() {
  const incomeAmount = trnsFormStore.values.amount[1]
  const incomeAmountRaw = trnsFormStore.values.amountRaw[1]

  trnsFormStore.values.amount[2] = incomeAmount
  trnsFormStore.values.amountRaw[2] = incomeAmountRaw
}
</script>

<template>
  <div>
    <template
      v-for="(item, slug) in items"
      :key="slug"
    >
      <div
        :class="cn('-m-1 grid gap-2 overflow-hidden rounded-sm border border-transparent p-2',
                   trnsFormStore.values.transferType === item.transferType && 'border-(--ui-primary)/50',
        )"
        @click="trnsFormStore.onChangeTransferType(item.transferType)"
      >
        <div class="flex items-center gap-2 whitespace-nowrap">
          <div
            :class="[{
              'bg-(--item-5)': trnsFormStore.values.transferType === item.transferType,
            }]"
            class="text-1/70 bg-item-3 interactive flex min-h-[44px] w-1/2 grow items-center rounded-sm px-3 py-2 text-sm lg:min-h-[42px]"
          >
            {{ t(`trnForm.transfer.${slug}`) }}
          </div>

          <TrnFormSelectorWallet
            v-if="slug === 'income' && incomeWalletId"
            :bottomSheetStyle="props.bottomSheetStyle"
            :title="t(`trnForm.transfer.${slug}`)"
            :walletId="incomeWalletId"
            @selected="id => trnsFormStore.values.incomeWalletId = id"
          />

          <TrnFormSelectorWallet
            v-if="slug === 'expense' && expenseWalletId"
            :bottomSheetStyle="props.bottomSheetStyle"
            :title="t(`trnForm.transfer.${slug}`)"
            :walletId="expenseWalletId"
            @selected="id => trnsFormStore.values.expenseWalletId = id"
          />
        </div>

        <!-- Input -->
        <TrnFormMainInput
          :key="item.amountsIdx"
          :amount="trnsFormStore.values.amount[item.amountsIdx]"
          :amountRaw="trnsFormStore.values.amountRaw[item.amountsIdx]"
          :highlight="item.transferType"
          :isShowSum="trnsFormStore.shouldShowSum()"
          isTransfer
          @change="trnsFormStore.onChangeAmount"
        />
      </div>

      <!-- Actions -->
      <div
        v-if="item.transferType === 'expense'"
        class="flex justify-center gap-1 pt-3 pb-1"
      >
        <UiActionButton @click="switchWallets">
          <Icon name="lucide:arrow-up-down" size="24" />
        </UiActionButton>

        <UiActionButton @click="copyAmount">
          <Icon name="lucide:clipboard-paste" size="24" />
        </UiActionButton>
      </div>
    </template>
  </div>
</template>
