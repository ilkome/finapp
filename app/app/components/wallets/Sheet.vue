<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { walletBalanceItems } from '~/components/loans/walletBalanceItems'
import { isCreditProduct } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useFeature } from '~/composables/useFeatures'

const props = defineProps<{
  walletId: WalletId
}>()

const emit = defineEmits<{
  closed: []
}>()

const { t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const isLoans = useFeature('loans')
const isShowStat = ref(false)
const isLaptop = useIsLaptop()

const wallet = computed(() => walletsStore.items?.[props.walletId])
const isCredit = computed(() => isCreditProduct(wallet.value?.type))
const balanceItems = computed(() => walletBalanceItems({
  creditLimit: wallet.value?.type === 'credit_card' ? wallet.value.creditLimit ?? 0 : 0,
  hasLoan: wallet.value?.type === 'loan',
  isCredit: isCredit.value,
  t,
  total: walletsStore.itemsComputed[props.walletId]?.amount ?? 0,
}))

// The page is left at once, so the sheet is dropped without waiting for its leave animation.
function openWallet() {
  emit('closed')
  router.push(`/wallets/${props.walletId}`)
}
</script>

<template>
  <UiSheet
    v-if="wallet"
    :title="wallet.name"
    :collapsedSnap="500"
    @closed="emit('closed')"
  >
    <div class="grid content-start gap-4 pb-32 md:pb-4" data-analytics-wallet-sheet>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-2">
        <StatSumItemView
          v-for="item in balanceItems"
          :key="item.title"
          :amount="item.amount"
          :currencyCode="wallet.currencyCode"
          :title="item.title"
          type="net"
          variant="summary"
        />
      </div>

      <LoansWalletSection v-if="isLoans && isCredit" :walletId isCompact />

      <!-- The drawer is as tall as its top snap point: the footer rides up to the visible bottom of the collapsed one. -->
      <div
        :class="isLaptop
          ? 'sticky bottom-0 grid gap-2 bg-default pt-2'
          : 'absolute inset-x-0 bottom-0 z-10 grid gap-2 bg-default px-3 py-2 transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)]'"
        :style="isLaptop ? undefined : 'transform: translateY(calc(-1 * var(--drawer-snap-lift, 0px)))'"
      >
        <UButton
          block
          color="neutral"
          size="xl"
          variant="soft"
          icon="i-lucide-chart-no-axes-combined"
          @click="isShowStat = true"
        >
          {{ t('stat.title') }}
        </UButton>
        <UButton
          block
          size="xl"
          icon="i-lucide-wallet"
          @click="openWallet"
        >
          {{ t('wallets.analytics.openWallet') }}
        </UButton>
      </div>

      <StatSheet
        v-if="isShowStat"
        :walletId
        @closed="isShowStat = false"
      />
    </div>
  </UiSheet>
</template>
