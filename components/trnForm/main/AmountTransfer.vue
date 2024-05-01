<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import type { WalletId } from '~~/components/wallets/types'
import { type TransferType, TrnType } from '~/components/trns/types'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const $trnForm = useTrnFormStore()
const walletsStore = useWalletsStore()
const { t } = useI18n()

const items = ref<
  Record<
    MoneyTypeSlug,
    {
      transferType: TransferType
      amountsIdx: 1 | 2
    }
  >
>({
  expense: {
    transferType: 0,
    amountsIdx: 1,
  },
  income: {
    transferType: 1,
    amountsIdx: 2,
  },
})

const incomeWalletId = computed<WalletId | null>(
  () => $trnForm.values.incomeWalletId ?? walletsStore.sortedIds[0],
)

const expenseWalletId = computed<WalletId | null>(
  () => $trnForm.values.expenseWalletId ?? walletsStore.sortedIds[1],
)

watch(
  () => $trnForm.values.trnType,
  (trnType) => {
    if (trnType === TrnType.Transfer) {
      $trnForm.values.incomeWalletId = incomeWalletId.value
      $trnForm.values.expenseWalletId = expenseWalletId.value
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
        :class="[
          { '!bg-item-3': $trnForm.values.transferType === item.transferType },
        ]"
        class="cursor-pointer overflow-hidden rounded-md"
        @click="$trnForm.onChangeTransferType(item.transferType)"
      >
        <!-- Wallet name -->
        <div
          class="grid grid-cols-[.4fr,1fr] items-center whitespace-nowrap px-3 pt-2"
        >
          <div class="w-1/2 grow text-sm text-primary/70">
            {{ t(slug) }}
          </div>

          <VDropdown v-if="slug === 'income' && incomeWalletId">
            <WalletsItem2 :walletId="incomeWalletId" />
            <template #popper="{ hide }">
              <WalletsSelector
                :hide="hide"
                @onSelected="id => $trnForm.values.incomeWalletId = id"
              />
            </template>
          </VDropdown>

          <VDropdown v-if="slug === 'expense' && expenseWalletId">
            <WalletsItem2 :walletId="expenseWalletId" />
            <template #popper="{ hide }">
              <WalletsSelector
                :hide="hide"
                @onSelected="id => $trnForm.values.expenseWalletId = id"
              />
            </template>
          </VDropdown>
        </div>

        <!-- Input -->
        <TrnFormMainInput
          :key="item.amountsIdx"
          :amount="$trnForm.values.amount[item.amountsIdx]"
          :amountRaw="$trnForm.values.amountRaw[item.amountsIdx]"
          :highlight="item.transferType === 1 ? 'expense' : 'income'"
          :isShowSum="$trnForm.getIsShowSum(item.amountsIdx)"
          isTransfer
          @onChange="$trnForm.onChangeAmount"
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
