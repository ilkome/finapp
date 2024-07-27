<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import type { WalletId, WalletItemWithAmount } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  alt?: boolean
  insideClasses?: string
  isShowBaseRate?: boolean
  isShowIcons?: boolean
  isSort?: boolean
  wallet: WalletItemWithAmount
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
  filter: [walletId: WalletId]
}>()

const creditViews = ['dept', 'sum'] as const
const activeCreditView = useStorage<typeof creditViews[number]>(props.walletId, 'dept')

const creditAmount = computed(() => {
  switch (activeCreditView.value) {
    case 'dept':
      return props.wallet.amount
    case 'sum':
      return Math.abs(props.wallet.creditLimit ?? 0) - Math.abs(props.wallet.amount)
    default:
      return 0
  }
})

function changeCreditView() {
  activeCreditView.value = creditViews[creditViews.findIndex(i => i === activeCreditView.value) + 1]
}
</script>

<template>
  <UiElement
    :isActive="activeItemId === props.walletId"
    :isShowIcons="props.isShowIcons"
    :insideClasses="props.insideClasses"
    :lineWidth="2"
    class="relative"
    @click="emit('click', props.walletId)"
  >
    <!-- Icon -->
    <template #leftIcon>
      <div
        v-if="isShowIcons"
        @click.stop="changeCreditView"
      >
        <UiIconWalletDeposit
          v-if="wallet.isDeposit"
          :style="{ color: wallet.color }"
          class="h-4 w-4 text-item-2"
        />
        <UiIconWalletSavings
          v-else-if="!wallet.isCredit"
          :style="{ color: wallet.color }"
          class="h-4 w-4 text-item-2"
        />
        <div v-else class="flex-center w-4">
          <WalletsIcon2
            :color="wallet.color"
            :name="wallet.name"
            :walletId="props.walletId"
          />
        </div>
      </div>

      <div v-if="!isShowIcons" class="px-1">
        <WalletsIcon2
          :color="wallet.color"
          :name="wallet.name"
          :walletId
          @click.stop="changeCreditView"
        />
      </div>
    </template>

    <!-- Main -->
    <template v-if="!props.alt">
      <div class="grow text-sm leading-none text-3">
        {{ wallet.name }}
      </div>

      <div class="pr-1 opacity-90">
        <Amount
          v-if="wallet.creditLimit"
          :amount="creditAmount"
          class="!text-secondary"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
        />
        <Amount
          v-else
          :amount="wallet.amount"
          class="!text-secondary"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
        />
      </div>
    </template>

    <!-- Alternative -->
    <template v-if="props.alt">
      <div class="grow">
        <Amount
          v-if="!isSort"
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="false"
          :isShowMinus="false"
          align="left"
          variant="2xs"
        />

        <div class="text-sm leading-none text-secondary">
          {{ wallet.name }}
        </div>
      </div>

      <div
        v-if="isSort"
        class="sortHandle insert-0 flex-center absolute right-0 top-0 h-full rounded-md px-3 group-hocus:bg-item-7"
      >
        <UiIconSort class="size-6" />
      </div>
    </template>
  </UiElement>
</template>
