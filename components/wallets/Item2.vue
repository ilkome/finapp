<script setup lang="ts">
import type { WalletId, WalletItemWithAmount } from '~/components/wallets/types'

defineProps<{
  wallet: WalletItemWithAmount
  walletId: WalletId
  isShowIcons?: boolean
}>()

const emit = defineEmits<{
  click: []
  filter: []
}>()
</script>

<template>
  <div @click="emit('click')">
    <div
      class="-my-[1px] text-secondary2 flex items-center px-2 py-1.5 min-h-[36px] hocus_bg-item-5 rounded-md"
    >
      <div class="overflow-hidden flex grow items-center gap-3 pl-1">
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
              @click.stop="emit('filter')"
            />
          </div>
        </template>

        <div v-if="!isShowIcons" class="px-1">
          <WalletsIcon2
            :color="wallet.color"
            :name="wallet.name"
            :walletId
            @click.stop="emit('filter')"
          />
        </div>

        <div class="text-item-base text-sm leading-none">
          {{ wallet.name }}
        </div>
      </div>

      <div class="grow text-item-base pr-1">
        <Amount
          :amount="wallet.amount"
          :currencyCode="wallet.currency"
          :isShowBaseRate="false"
          size="base"
          class="opacity-90"
        />
      </div>
    </div>
    <div class="mr-2 ml-9 h-[1px] bg-item-5" :class="{ 'ml-9': isShowIcons, 'ml-7': !isShowIcons }" />
  </div>
</template>
