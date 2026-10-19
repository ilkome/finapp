<script setup lang="ts">
import type { WalletId, WalletItemComputed } from '~/components/wallets/types'

import { getCreditAvailable, isCreditProduct } from '~/components/wallets/types'
import { useFeature } from '~/composables/useFeatures'

const props = defineProps<{
  activeItemId?: WalletId | null
  amount?: number
  /** Base currency the rate is shown against; the rate row is hidden without it. */
  baseCurrencyCode?: string
  compact?: boolean
  insideClasses?: string
  isSelected?: boolean
  isShowBaseRate?: boolean
  isShowCreditLimit?: boolean
  isShowIcon?: boolean
  isShowRate?: boolean
  lineWidth?: number
  to?: string
  wallet: WalletItemComputed
  walletId: WalletId
  /** Row background of the lists; `compact` has its own. */
  withBackground?: boolean
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
}>()

const isLoans = useFeature('loans')

const classes = computed(() => ({
  'bg-elevated/30': (props.compact || props.withBackground) && !props.isSelected,
  'bg-elevated/70': props.isSelected,
  'rounded-md': props.compact || props.withBackground,
}))

const walletCreditLimit = computed(() =>
  props.wallet.type === 'credit_card' ? props.wallet.creditLimit : 0,
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
          v-if="props.isShowRate && props.baseCurrencyCode && wallet.currencyCode !== props.baseCurrencyCode && wallet.rate"
          class="opacity-90"
        >
          <Amount
            :amount="wallet.rate"
            :precision="2"
            :currencyCode="props.baseCurrencyCode"
            :isShowBaseRate="false"
            align="left"
            variant="secondary"
            class="text-xs opacity-70"
          />
        </div>

        <LoansWalletCardLine
          v-if="isLoans && props.isShowCreditLimit && isCreditProduct(wallet.type)"
          :wallet="props.wallet"
          :walletId="props.walletId"
        />

        <div
          v-if="props.isShowCreditLimit && wallet.type === 'credit_card' && walletCreditLimit"
          class="flex items-center gap-0.5 opacity-70"
        >
          <Amount
            :amount="getCreditAvailable(walletCreditLimit, wallet.amount)"
            :currencyCode="wallet.currencyCode"
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
            :currencyCode="wallet.currencyCode"
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
          :currencyCode="wallet.currencyCode"
          :isShowBaseRate="props.isShowBaseRate"
          variant="row"
        />
        <Amount
          v-else
          :amount="displayAmount"
          :currencyCode="wallet.currencyCode"
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

        <div>
          <Amount
            v-if="walletCreditLimit"
            :amount="displayAmount"
            :currencyCode="wallet.currencyCode"
            :isShowBaseRate="false"
            :isShowMinus="false"
            align="left"
            variant="secondary"
          />
          <Amount
            v-else
            :amount="displayAmount"
            :currencyCode="wallet.currencyCode"
            :isShowBaseRate="props.isShowBaseRate"
            :isShowMinus="false"
            align="left"
            variant="secondary"
          />
        </div>
      </div>
    </template>
  </UiElement>
</template>
