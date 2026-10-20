<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/amount/types'
import type { TransferSide } from '~/components/trns/types'

import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'

const trnsFormStore = useTrnsFormStore()
const { t } = useI18n()

const items: Record<MoneyTypeSlug, { amountsIdx: 1 | 2, side: TransferSide }> = {
  expense: { amountsIdx: 1, side: 'from' },
  income: { amountsIdx: 2, side: 'to' },
}

function sideWalletId(side: TransferSide) {
  return side === 'from' ? trnsFormStore.transferFromWalletId : trnsFormStore.transferToWalletId
}

function otherWalletIds(side: TransferSide) {
  const id = sideWalletId(side === 'from' ? 'to' : 'from')
  return id ? [id] : []
}

watch(
  () => trnsFormStore.values.trnType,
  (trnType) => {
    if (trnType === 'transfer') {
      trnsFormStore.values.toWalletId ??= trnsFormStore.transferToWalletId ?? null
      trnsFormStore.values.fromWalletId ??= trnsFormStore.transferFromWalletId ?? null

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
        :amountRaw="trnsFormStore.values.amountRaw[1]"
        :isShowSum="trnsFormStore.shouldShowSum()"
        @change="trnsFormStore.onChangeTransferAmountSynced"
      />

      <div class="flex items-center gap-2 pt-3">
        <TrnFormSelectorWallet
          v-if="trnsFormStore.transferFromWalletId"
          :disabledWalletIds="otherWalletIds('from')"
          :title="t('trnForm.transfer.expenseModal')"
          :walletId="trnsFormStore.transferFromWalletId"
          class="min-w-0 flex-1"
          @selected="id => trnsFormStore.onTransferWalletSelected('from', id)"
        />

        <UiActionButton :ariaLabel="$t('wallets.ariaSwitch')" @click="trnsFormStore.switchTransferWallets">
          <Icon name="lucide:repeat" size="24" />
        </UiActionButton>

        <TrnFormSelectorWallet
          v-if="trnsFormStore.transferToWalletId"
          :disabledWalletIds="otherWalletIds('to')"
          :title="t('trnForm.transfer.incomeModal')"
          :walletId="trnsFormStore.transferToWalletId"
          class="min-w-0 flex-1"
          @selected="id => trnsFormStore.onTransferWalletSelected('to', id)"
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
            trnsFormStore.values.transferType === item.side && 'bg-elevated/50',
          )"
          @click="trnsFormStore.values.transferOutside !== item.side && trnsFormStore.onChangeTransferType(item.side)"
        >
          <div class="flex items-center gap-2 whitespace-nowrap">
            <div
              :class="[{
                'bg-elevated': trnsFormStore.values.transferType === item.side,
              }]"
              class="flex min-h-11 w-1/2 grow items-center rounded-sm interactive px-3 py-2 text-sm text-highlighted/70 lg:min-h-10.5"
            >
              {{ t(`trnForm.transfer.${slug}Label`) }}
            </div>

            <TrnFormSelectorWallet
              v-if="trnsFormStore.values.transferOutside !== item.side && sideWalletId(item.side)"
              :disabledWalletIds="otherWalletIds(item.side)"
              :title="t(`trnForm.transfer.${slug}Modal`)"
              :walletId="sideWalletId(item.side)!"
              class="grow"
              @selected="id => trnsFormStore.onTransferWalletSelected(item.side, id)"
            />

            <UButton
              v-if="trnsFormStore.values.transferOutside === item.side"
              :label="t('trnForm.transfer.outside')"
              color="neutral"
              variant="soft"
              @click.stop="trnsFormStore.onTransferOutside(undefined)"
            />

            <UiActionButton
              v-else-if="!trnsFormStore.values.transferOutside"
              :ariaLabel="t('trnForm.transfer.outsideAria')"
              @click.stop="trnsFormStore.onTransferOutside(item.side)"
            >
              <Icon name="lucide:globe" size="20" />
            </UiActionButton>
          </div>

          <!-- Input -->
          <TrnFormMainInput
            v-if="trnsFormStore.values.transferOutside !== item.side"
            :key="item.amountsIdx"
            :amountRaw="trnsFormStore.values.amountRaw[item.amountsIdx]"
            :highlight="slug"
            :isShowSum="trnsFormStore.shouldShowSum()"
            isTransfer
            @change="trnsFormStore.onChangeAmount"
          />
        </div>

        <!-- Actions -->
        <div
          v-if="item.side === 'from' && !trnsFormStore.values.transferOutside"
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
