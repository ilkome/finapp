<script setup lang="ts">
import useAmount from '~/components/amount/useAmount'
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId, WalletItem } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  activeType: string // TODO: types
  currencyCode: CurrencyCode
  walletsItems: Record<WalletId, WalletItem>
}>()

const emit = defineEmits<{
  click: [v: string]
}>()

const { t } = useI18n()
const { getAmountInBaseRate } = useAmount()
const walletsStore = useWalletsStore()

const totalInWallets = computed(() => {
  const total = {
    all: 0,
    counted: 0,
    creditPossible: 0,
    credits: 0,
    isCash: 0,
    isCashless: 0,
    isDeposit: 0,
    withdrawal: 0,
  }

  for (const walletId in props.walletsItems) {
    const wallet = props.walletsItems[walletId]
    if (!wallet)
      continue

    const itemValue = wallet.currency === props.currencyCode
      ? walletsStore.totals[walletId] ?? 0
      : +getAmountInBaseRate({
          amount: walletsStore.totals[walletId] ?? 0,
          currencyCode: wallet.currency ?? 'USD',
          noFormat: true,
        })

    total.all += itemValue

    if (wallet.isCash)
      total.isCash += itemValue

    if (wallet.isCashless)
      total.isCashless += itemValue

    if (wallet.creditLimit) {
      total.creditPossible = total.creditPossible + +getAmountInBaseRate({
        amount: wallet.creditLimit ?? 0,
        currencyCode: wallet.currency ?? 'USD',
        noFormat: true,
      })
    }

    if (wallet.isDeposit)
      total.isDeposit += itemValue

    if (wallet.withdrawal)
      total.withdrawal += itemValue

    else if (wallet.isCredit)
      total.credits += itemValue
  }

  return total
})

const counts = computed(() => ({
  all: {
    id: 'all',
    isShow: true,
    value: totalInWallets.value.all,
  },
  isCash: {
    id: 'isCash',
    isShow: totalInWallets.value.isCash !== 0,
    value: totalInWallets.value.isCash,
  },
  isCashless: {
    id: 'isCashless',
    isShow: totalInWallets.value.isCashless !== 0,
    value: totalInWallets.value.isCashless,
  },
  isCredit: {
    id: 'isCredit',
    isShow: totalInWallets.value.credits !== 0,
    value: totalInWallets.value.credits,
  },
}))

const counts2 = computed(() => ({
  withdrawal: {
    icon: 'UiIconWalletWithdrawal',
    id: 'withdrawal',
    isShow: totalInWallets.value.withdrawal !== 0,
    value: totalInWallets.value.withdrawal,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  isDeposit: {
    icon: 'isDeposit',
    id: 'isDeposit',
    isShow: totalInWallets.value.isDeposit !== 0,
    value: totalInWallets.value.isDeposit,
  },
  // eslint-disable-next-line perfectionist/sort-objects
  creditPossible: {
    id: 'creditPossible',
    isShow: totalInWallets.value.creditPossible !== 0,
    value: totalInWallets.value.creditPossible,
  },
  withCredit: {
    id: 'withCredit',
    isShow: totalInWallets.value.credits !== 0,
    value: totalInWallets.value.all + -totalInWallets.value.credits,
  },
}))
</script>

<template>
  <UiToggle
    :initStatus="true"
    openPadding="pb-3"
    storageKey="finapp-wallets-total"
  >
    <!-- Header -->
    <template #header="{ toggle, isShown }">
      <div class="flex items-center justify-between">
        <UiTitle8 :isShown @click="toggle">
          {{ t('totalTitle') }}
        </UiTitle8>
      </div>
    </template>

    <div class="grid gap-2 @md/wallets:grid-cols-2">
      <div class="">
        <UiElement
          v-for="(item) in Object.values(counts).filter(item => item.isShow)"
          :key="item.id"
          :isActive="props.activeType === item.id"
          isShowLine
          class="group"
          insideClasses="!min-h-[48px]"
          @click="emit('click', item.id)"
        >
          <div
            class="pl-1 grow text-sm leading-none text-secondary"
          >
            {{ $t(`money.totals.${item.id}`) }}
          </div>

          <div class="pr-1 opacity-90">
            <Amount
              :amount="item.value"
              :currencyCode="currencyCode"
            />
          </div>
        </UiElement>

        <UiElement
          v-for="(item) in Object.values(counts2).filter(item => item.isShow)"
          :key="item.id"
          :isActive="props.activeType === item.id"
          isShowLine
          class="group"
          insideClasses="!min-h-[48px]"
          @click="emit('click', item.id)"
        >
          <div
            class="pl-1 grow text-sm leading-none text-secondary"
          >
            {{ $t(`money.totals.${item.id}`) }}
          </div>

          <div class="pr-1 opacity-90">
            <Amount
              :amount="item.value"
              :currencyCode="currencyCode"
            />
          </div>
        </UiElement>
      </div>
    </div>
  </UiToggle>
</template>

<i18n lang="yaml">
en:
  totalTitle: Statistics

ru:
  totalTitle: Статистика
</i18n>
