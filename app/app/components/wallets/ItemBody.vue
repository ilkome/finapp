<script setup lang="ts">
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { getCreditAvailable } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  amount?: number
  compact?: boolean
  insideClasses?: string
  isShowBaseRate?: boolean
  isShowCreditLimit?: boolean
  isShowIcon?: boolean
  isShowRate?: boolean
  isSort?: boolean
  lineWidth?: number
  to?: string
  wallet: WalletItemComputed
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
}>()

const currenciesStore = useCurrenciesStore()

const classes = computed(() => ({
  'bg-elevated/30': props.compact,
  'group relative': props.isSort,
  'rounded-md': props.compact,
}))

const walletCreditLimit = computed(() =>
  props.wallet.type === 'credit' ? props.wallet.creditLimit : 0,
)
const displayAmount = computed(() => props.amount ?? props.wallet.amount)
</script>

<template>
  <UiElement
    v-if="wallet"
    :isActive="activeItemId === props.walletId"
    :insideClasses="`${props.insideClasses ?? ''} min-h-[46px]`"
    :lineWidth="props.lineWidth"
    :to="props.to"
    :class="classes"
    @click="emit('click', props.walletId)"
  >
    <!-- Icon -->
    <template v-if="props.isShowIcon" #leftIcon>
      <WalletsIcon
        :name="wallet.name"
        :color="wallet.color"
      />
    </template>

    <!-- Main -->
    <template v-if="!props.compact">
      <div class="grid grow gap-1 overflow-hidden">
        <UiEntityName>
          {{ wallet.name }}
        </UiEntityName>

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
            variant="secondary"
            class="text-xs opacity-70"
          />
        </div>

        <div
          v-if="props.isShowCreditLimit && wallet.type === 'credit' && walletCreditLimit"
          class="flex items-center gap-0.5 opacity-70"
        >
          <Amount
            :amount="getCreditAvailable(walletCreditLimit, wallet.amount)"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            :isShowSymbol="false"
            align="left"
            variant="secondary"
          />

          <div
            v-if="wallet.amount !== 0"
            class="text-2xs leading-none opacity-70"
          >
            /
          </div>

          <Amount
            v-if="wallet.amount !== 0"
            :amount="walletCreditLimit"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            :isShowSymbol="false"
            align="left"
            variant="secondary"
          />
        </div>
      </div>

      <div class="pr-1">
        <Amount
          v-if="walletCreditLimit"
          :amount="displayAmount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
          variant="row"
        />
        <Amount
          v-else
          :amount="displayAmount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
          variant="row"
        />
      </div>
    </template>

    <!-- Alternative -->
    <template v-if="props.compact">
      <div class="grid grow gap-0.5 overflow-hidden">
        <UiEntityName variant="compact">
          {{ wallet.name }}
        </UiEntityName>

        <div v-if="!isSort">
          <Amount
            v-if="walletCreditLimit"
            :amount="displayAmount"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            :isShowMinus="false"
            align="left"
            variant="secondary"
          />
          <Amount
            v-else
            :amount="displayAmount"
            :currencyCode="wallet.currency"
            :isShowBaseRate="props.isShowBaseRate"
            :isShowMinus="false"
            align="left"
            variant="secondary"
          />
        </div>
      </div>

      <div
        v-if="isSort"
        class="sortHandle absolute right-0 flex-center h-full rounded-md px-3 group-hover:bg-accented"
      >
        <Icon name="lucide:grip-vertical" size="20" />
      </div>
    </template>
  </UiElement>
</template>
