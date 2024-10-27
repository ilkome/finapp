<script setup lang="ts">
import { onLongPress, useStorage } from '@vueuse/core'
import type { WalletId, WalletItemWithAmount } from '~/components/wallets/types'
import { icons } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  alt?: boolean
  insideClasses?: string
  isShowBaseRate?: boolean
  isShowIcons?: boolean
  isSort?: boolean
  lineWidth?: number
  wallet: WalletItemWithAmount
  walletId: WalletId
}>()

const emit = defineEmits<{
  click: [walletId: WalletId]
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

const longPressRef = ref(null)
onLongPress(
  longPressRef,
  changeCreditView,
  { delay: 600, modifiers: { prevent: true, stop: true } },
)
</script>

<template>
  <UiElement
    ref="longPressRef"
    :isActive="activeItemId === props.walletId"
    :isShowIcons="props.isShowIcons"
    :insideClasses="`${props.insideClasses ? props.insideClasses : ''} min-h-[44px] lg:min-h-[42px]`"
    :lineWidth="props.lineWidth"
    class="relative"
    @click="emit('click', props.walletId)"
  >
    <!-- Icon -->
    <template v-if="isShowIcons" #leftIcon>
      <Icon
        :name="icons[wallet.type]"
        :style="{ color: wallet.color }"
        class="size-5"
      />
    </template>

    <!-- Main -->
    <template v-if="!props.alt">
      <div class="text-3 grow text-sm leading-none">
        {{ wallet.name }}
      </div>

      <div
        class="pr-1 opacity-90"
        :class="{
          'text-accent-4': creditAmount > 0,
          'text-accent-1': creditAmount < 0,
        }"
      >
        <Amount
          v-if="wallet.creditLimit"
          :amount="creditAmount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
        />
        <Amount
          v-else
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
        />
      </div>
    </template>

    <!-- Alternative -->
    <template v-if="props.alt">
      <div class="grid grow gap-0.5">
        <div
          v-if="!isSort"
        >
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

        <div class="text-3 whitespace-nowrap text-sm leading-none">
          {{ wallet.name }}
        </div>
      </div>

      <div
        v-if="isSort"
        class="sortHandle insert-0 flex-center group-hocus:bg-item-5 absolute right-0 top-0 h-full rounded-md px-3"
      >
        <UiIconSort class="size-6" />
      </div>
    </template>
  </UiElement>
</template>
