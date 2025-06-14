<script setup lang="ts">
import { onLongPress, useStorage } from '@vueuse/core'

import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getStyles } from '~/components/ui/getStyles'
import { icons } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  alt?: boolean
  insideClasses?: string
  isShowBaseRate?: boolean
  isShowCreditLimit?: boolean
  isShowIcon?: boolean
  isShowRate?: boolean
  isSort?: boolean
  lineWidth?: number
  wallet: WalletItemComputed
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
}>()

const currenciesStore = useCurrenciesStore()

const classes = computed(() => ([
  'relative',
  {
    [getStyles('item', ['bg2', 'rounded'])]: props.alt,
  },
  {
    group: props.isSort,
  },
]))

const creditViews = ['dept', 'summary'] as const
const activeCreditView = useStorage<typeof creditViews[number]>(props.walletId, 'dept')

const creditAmount = computed(() => {
  switch (activeCreditView.value) {
    case 'dept':
      return props.wallet?.amount
    case 'summary':
      return Math.abs(props.wallet.creditLimit ?? 0) - Math.abs(props.wallet.amount)
    default:
      return 0
  }
})

const longPressRef = ref(null)
if (!props.isSort) {
  onLongPress(
    longPressRef,
    () => {
      activeCreditView.value = creditViews[creditViews.findIndex(i => i === activeCreditView.value) + 1]
    },
  )
}
</script>

<template>
  <UiElement
    v-if="wallet"
    ref="longPressRef"
    :isActive="activeItemId === props.walletId"
    :insideClasses="`${props.insideClasses ? props.insideClasses : ''} min-h-[46px]`"
    :lineWidth="props.lineWidth"
    :class="classes"
    @click="emit('click', props.walletId)"
  >
    <!-- Icon -->
    <template v-if="props.isShowIcon" #leftIcon>
      <Icon
        :name="icons[wallet.type]"
        :style="{ color: wallet.color }"
        size="20"
      />
    </template>

    <!-- Main -->
    <template v-if="!props.alt">
      <div class="grid grow gap-1">
        <div class="text-sm leading-none text-muted">
          {{ wallet.name }}
        </div>

        <!-- Rate -->
        <div
          v-if="props.isShowRate && wallet.currency !== currenciesStore.base && wallet.rate"
          class="opacity-90"
        >
          <Amount
            :amount="wallet.rate"
            :precision="2"
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
            align="left"
            variant="2xs"
            class="text-xs opacity-70"
          />
        </div>

        <div
          v-if="props.isShowCreditLimit && wallet.type === 'credit' && wallet.creditLimit"
          class="flex items-center gap-0.5 opacity-70"
        >
          <Amount
            :amount="wallet.creditLimit - Math.abs(wallet.amount)"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            :isShowSymbol="false"
            align="left"
            variant="2xs"
          />

          <div
            v-if="wallet.amount !== 0"
            class="text-2xs leading-none opacity-70"
          >
            /
          </div>

          <Amount
            v-if="wallet.amount !== 0"
            :amount="wallet.creditLimit"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            :isShowSymbol="false"
            align="left"
            variant="2xs"
          />
        </div>
      </div>

      <div class="pr-1">
        <Amount
          v-if="wallet.creditLimit"
          :amount="creditAmount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
          variant="sm"
        />
        <Amount
          v-else
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
          variant="sm"
        />
      </div>
    </template>

    <!-- Alternative -->
    <template v-if="props.alt">
      <div class="grid grow gap-0.5">
        <div class="whitespace-nowrap text-xs leading-none text-2">
          {{ wallet.name }}
        </div>

        <div v-if="!isSort">
          <Amount
            v-if="wallet.creditLimit"
            :amount="creditAmount"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            :isShowMinus="false"
            align="left"
            variant="2xs"
          />
          <Amount
            v-else
            :amount="wallet.amount"
            :currencyCode="wallet.currency"
            :isShowBaseRate="props.isShowBaseRate"
            :isShowMinus="false"
            align="left"
            variant="2xs"
          />
        </div>
      </div>

      <div
        v-if="isSort"
        class="sortHandle flex-center absolute right-0 h-full rounded-md px-3 group-hover:bg-[var(--item-6)]"
      >
        <Icon name="lucide:grip-vertical" size="20" />
      </div>
    </template>
  </UiElement>
</template>
