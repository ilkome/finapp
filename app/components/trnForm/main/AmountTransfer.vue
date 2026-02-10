<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import type { TransferType } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'
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
  <div class="">
    <template
      v-for="(item, slug) in items"
      :key="slug"
    >
      <div
        :class="[{
          '!border-(--ui-primary)/50': trnsFormStore.values.transferType === item.transferType,
        }, getStyles('item', ['rounded'])]"
        class="-m-1 grid gap-2 overflow-hidden border border-transparent p-2"
        @click="trnsFormStore.onChangeTransferType(item.transferType)"
      >
        <div class="flex items-center gap-2 whitespace-nowrap">
          <div
            :class="[getStyles('item', ['bg2', 'link', 'rounded']), {
              'bg-[var(--item-5)]': trnsFormStore.values.transferType === item.transferType,
            }]"
            class="text-1/70 flex min-h-[44px] w-1/2 grow items-center px-3 py-2 text-sm lg:min-h-[42px]"
          >
            {{ t(`trnForm.transfer.${slug}`) }}
          </div>

          <TrnFormSelectorWallet
            v-if="slug === 'income' && incomeWalletId"
            :bottomSheetStyle="props.bottomSheetStyle"
            :isLaptop
            :title="t(`trnForm.transfer.${slug}`)"
            :walletId="incomeWalletId"
            @onOpen="n => emit('onOpen', n)"
            @onSelected="id => trnsFormStore.values.incomeWalletId = id"
          />

          <TrnFormSelectorWallet
            v-if="slug === 'expense' && expenseWalletId"
            :bottomSheetStyle="props.bottomSheetStyle"
            :isLaptop
            :title="t(`trnForm.transfer.${slug}`)"
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
          :highlight="item.transferType === 0 ? 'expense' : 'income'"
          :isShowSum="trnsFormStore.getIsShowSum()"
          isTransfer
          @onChange="trnsFormStore.onChangeAmount"
        />
      </div>

      <!-- Actions -->
      <div
        v-if="item.transferType === 0"
        class="flex justify-center gap-1 pt-3 pb-1"
      >
        <UiItem1 @click="switchWallets">
          <Icon name="lucide:arrow-up-down" size="24" />
        </UiItem1>

        <UiItem1 @click="copyAmount">
          <Icon name="lucide:clipboard-paste" size="24" />
        </UiItem1>
      </div>
    </template>
  </div>
</template>
