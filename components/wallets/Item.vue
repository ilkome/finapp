<script setup lang="ts">
import type { WalletId, WalletItemWithAmount } from '~/components/wallets/types'

const props = defineProps<{
  activeItemId?: WalletId
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
</script>

<template>
  <UiElement
    :isActive="activeItemId === props.walletId"
    :isShowIcons="props.isShowIcons"
    :hideDivider="!alt"
    class="relative group"
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
            :walletId
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
      <div class="text-sm leading-none">
        {{ wallet.name }}
      </div>

      <div class="grow pr-1">
        <Amount
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="props.isShowBaseRate"
          class="opacity-90"
          size="base"
        />
      </div>
    </template>

    <!-- Alternative -->
    <template v-if="props.alt">
      <div class="grow">
        <div class="text-2xs">
          <Amount
            :amount="wallet.amount"
            :currencyCode="wallet.currency"
            :isShowBaseRate="false"
            align="left"
          />
        </div>

        <div class="text-secondary text-sm leading-none">
          {{ wallet.name }}
        </div>
      </div>

      <div
        v-if="isSort"
        class="
          sortHandle
          group-hocus_bg-item-7
          absolute right-0 top-0 insert-0
          h-full flex-center px-3 rounded-md
        "
      >
        <UiIconSort class="size-6" />
      </div>
    </template>
  </UiElement>
</template>
