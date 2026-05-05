<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/stat/types'
import type { TransferSide } from '~/components/trns/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { TrnType } from '~/components/trns/types'

const props = defineProps<{
  bottomSheetStyle?: Record<string, string>
}>()

const trnsFormStore = useTrnsFormStore()
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

watch(
  () => trnsFormStore.values.trnType,
  (trnType) => {
    if (trnType === TrnType.Transfer) {
      if (!trnsFormStore.values.incomeWalletId)
        trnsFormStore.transferIncomeWalletId && (trnsFormStore.values.incomeWalletId = trnsFormStore.transferIncomeWalletId)

      if (!trnsFormStore.values.expenseWalletId)
        trnsFormStore.transferExpenseWalletId && (trnsFormStore.values.expenseWalletId = trnsFormStore.transferExpenseWalletId)

      if (trnsFormStore.values.amount[1] === 0) {
        trnsFormStore.values.amount[1] = trnsFormStore.values.amount[0]
        trnsFormStore.values.amountRaw[1] = trnsFormStore.values.amountRaw[0]
      }

      if (trnsFormStore.isSameCurrencyTransfer && trnsFormStore.values.amount[2] === 0) {
        trnsFormStore.values.amount[2] = trnsFormStore.values.amount[1]
        trnsFormStore.values.amountRaw[2] = trnsFormStore.values.amountRaw[1]
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <!-- Same currency: input first, then wallets -->
    <template v-if="trnsFormStore.isSameCurrencyTransfer">
      <TrnFormMainInput
        :amount="trnsFormStore.values.amount[1]"
        :amountRaw="trnsFormStore.values.amountRaw[1]"
        :isShowSum="trnsFormStore.shouldShowSum()"
        @change="trnsFormStore.onChangeTransferAmountSynced"
      />

      <div class="flex items-center gap-2 pt-3">
        <TrnFormSelectorWallet
          v-if="trnsFormStore.transferExpenseWalletId"
          :bottomSheetStyle="props.bottomSheetStyle"
          :disabledWalletIds="trnsFormStore.transferIncomeWalletId ? [trnsFormStore.transferIncomeWalletId] : []"
          :title="t('trnForm.transfer.expenseModal')"
          :walletId="trnsFormStore.transferExpenseWalletId"
          class="min-w-0 flex-1"
          @selected="id => trnsFormStore.onTransferWalletSelected('expense', id)"
        />

        <UiActionButton :ariaLabel="$t('wallets.ariaSwitch')" @click="trnsFormStore.switchTransferWallets">
          <Icon name="lucide:repeat" size="24" />
        </UiActionButton>

        <TrnFormSelectorWallet
          v-if="trnsFormStore.transferIncomeWalletId"
          :bottomSheetStyle="props.bottomSheetStyle"
          :disabledWalletIds="trnsFormStore.transferExpenseWalletId ? [trnsFormStore.transferExpenseWalletId] : []"
          :title="t('trnForm.transfer.incomeModal')"
          :walletId="trnsFormStore.transferIncomeWalletId"
          class="min-w-0 flex-1"
          @selected="id => trnsFormStore.onTransferWalletSelected('income', id)"
        />
      </div>
    </template>

    <!-- Different currencies: current two-input layout -->
    <template v-else>
      <template
        v-for="(item, slug) in items"
        :key="slug"
      >
        <div
          :class="cn(
            '-m-1 grid gap-2 overflow-hidden rounded-sm border border-transparent p-2',
            trnsFormStore.values.transferType === item.transferType && 'border-primary/50',
          )"
          @click="trnsFormStore.onChangeTransferType(item.transferType)"
        >
          <div class="flex items-center gap-2 whitespace-nowrap">
            <div
              :class="[{
                'bg-elevated': trnsFormStore.values.transferType === item.transferType,
              }]"
              class="text-highlighted/70 interactive flex min-h-[44px] w-1/2 grow items-center rounded-sm px-3 py-2 text-sm lg:min-h-[42px]"
            >
              {{ t(`trnForm.transfer.${slug}Label`) }}
            </div>

            <TrnFormSelectorWallet
              v-if="slug === 'income' && trnsFormStore.transferIncomeWalletId"
              :bottomSheetStyle="props.bottomSheetStyle"
              :disabledWalletIds="trnsFormStore.transferExpenseWalletId ? [trnsFormStore.transferExpenseWalletId] : []"
              :title="t(`trnForm.transfer.${slug}Modal`)"
              :walletId="trnsFormStore.transferIncomeWalletId"
              @selected="id => trnsFormStore.onTransferWalletSelected('income', id)"
            />

            <TrnFormSelectorWallet
              v-if="slug === 'expense' && trnsFormStore.transferExpenseWalletId"
              :bottomSheetStyle="props.bottomSheetStyle"
              :disabledWalletIds="trnsFormStore.transferIncomeWalletId ? [trnsFormStore.transferIncomeWalletId] : []"
              :title="t(`trnForm.transfer.${slug}Modal`)"
              :walletId="trnsFormStore.transferExpenseWalletId"
              @selected="id => trnsFormStore.onTransferWalletSelected('expense', id)"
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
          <UiActionButton :ariaLabel="$t('wallets.ariaSwitch')" @click="trnsFormStore.switchTransferWallets">
            <Icon name="lucide:arrow-up-down" size="24" />
          </UiActionButton>

          <UiActionButton :ariaLabel="$t('trnForm.ariaCopyAmount')" @click="trnsFormStore.copyTransferAmount">
            <Icon name="lucide:clipboard-paste" size="24" />
          </UiActionButton>
        </div>
      </template>
    </template>
  </div>
</template>
