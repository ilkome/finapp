<script setup lang="ts">
import type {
  WalletId,
  WalletItem,
  WalletItemWithAmount,
} from '~/components/wallets/types'
import { getStyles } from '~/components/ui/classes'

defineProps<{
  wallet: WalletItemWithAmount | WalletItem
  walletId: WalletId
  isShowIcons?: boolean
}>()

const emit = defineEmits<{
  click: []
  filter: []
}>()
</script>

<template>
  <div
    :class="getStyles('item', ['link', 'bg', 'rounded', 'padding1', 'minh'])"
    class="flex items-center"
    @click="emit('click')"
  >
    <div class="flex grow items-center gap-3 overflow-hidden pl-1">
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

    <div v-if="wallet.amount" class="text-item-base grow pr-1">
      <Amount
        :amount="wallet.amount"
        :currencyCode="wallet.currency"
        :isShowBaseRate="false"
        size="base"
        class="opacity-90"
      />
    </div>
  </div>
</template>
