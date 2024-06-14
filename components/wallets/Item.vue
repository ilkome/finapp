<script setup lang="ts">
import type {
  WalletId,
  WalletItemWithAmount,
} from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId | null
  alt?: boolean
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

const isShowCredit = ref(false)
</script>

<template>
  <UiElement
    :isActive="activeItemId === props.walletId"
    :isShowIcons="props.isShowIcons"
    :hideDivider="!alt"
    isShowLine
    class="group relative"
    @click="emit('click', props.walletId)"
  >
    <!-- Icon -->
    <template #leftIcon>
      <template v-if="isShowIcons">
        <UiIconWalletWithdrawal
          v-if="wallet.countTotal"
          :style="{ color: wallet.color }"
          class="h-4 w-4 text-item-2"
        />
        <UiIconWalletSavings
          v-else-if="!wallet.countTotal && !wallet.isCredit"
          :style="{ color: wallet.color }"
          class="h-4 w-4 text-item-2"
        />
        <div v-else class="flex-center w-4">
          <WalletsIcon2
            :color="wallet.color"
            :name="wallet.name"
            :walletId="props.walletId"
            @click.stop="emit('filter', props.walletId)"
          />
        </div>
      </template>

      <div v-if="!isShowIcons" class="px-1">
        <WalletsIcon2
          :color="wallet.color"
          :name="wallet.name"
          :walletId
          @click.stop="emit('filter', props.walletId)"
        />
      </div>
    </template>

    <!-- Main -->
    <template v-if="!props.alt">
      <div class="grow text-sm leading-none text-secondary">
        {{ wallet.name }}
      </div>

      <div class="_grow pr-1 opacity-90">
        <Amount
          v-if="wallet.creditLimit"
          :amount="isShowCredit ? Math.abs(wallet.creditLimit) - Math.abs(wallet.amount) : wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
          class="hocus_!bg-neutral-700/50 p-2 -m-2 rounded-lg"
          @click.stop="isShowCredit = !isShowCredit"
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
      <div class="grow">
        <Amount
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
        class="sortHandle insert-0 flex-center absolute right-0 top-0 h-full rounded-md px-3 group-hocus_bg-item-7"
      >
        <UiIconSort class="size-6" />
      </div>
    </template>
  </UiElement>
</template>
